"""Experimental crash-recoverable file transaction for the LEGO laboratory.

Only protects *project files* written by this adapter. It does not roll back
npm lifecycle scripts, network effects, running processes, or external services.
Recovery requires --recover after abrupt termination. Do not claim ACID.
"""
from __future__ import annotations

import base64
import hashlib
import json
import os
import re
import shutil
import signal
import stat
import tempfile
from pathlib import Path, PurePosixPath

DIRNAME = '.lego-install-txn'
MANIFEST = 'manifest.json'
MAX_BACKUP_BYTES = 24 * 1024 * 1024
ALLOWED_EXACT = {'package.json', 'pnpm-lock.yaml', 'pnpm-workspace.yaml'}
HEX = re.compile(r'^[0-9a-f]{64}$')

class TransactionRejected(ValueError):
    pass


def digest(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def _rel(path: str) -> str:
    if not isinstance(path, str) or not path or '\\' in path or '\x00' in path or ':' in path:
        raise TransactionRejected('Invalid transaction path')
    posix = PurePosixPath(path)
    parts = path.split('/')
    if posix.is_absolute() or any(p in ('', '..', '.') or p.startswith('.') for p in parts):
        raise TransactionRejected('Unsafe transaction path')
    if path != posix.as_posix() or parts[0] in ('node_modules', 'dist', 'coverage'):
        raise TransactionRejected('Invalid transaction target')
    return path


def _safe_file(root: Path, rel: str) -> Path:
    path = root / _rel(rel)
    if path.is_symlink():
        raise TransactionRejected('Symlink file in transaction: '+rel)
    cursor = path.parent
    while cursor != root:
        if cursor.is_symlink():
            raise TransactionRejected('Symlink directory in transaction: '+rel)
        if cursor == cursor.parent:
            raise TransactionRejected('Transaction escaped project')
        cursor = cursor.parent
    return path


def _sync_dir(folder: Path) -> None:
    try:
        handle = os.open(folder, os.O_RDONLY | getattr(os, 'O_DIRECTORY', 0))
        try:
            os.fsync(handle)
        finally:
            os.close(handle)
    except OSError:
        # Some platforms do not support fsync on directories.
        pass


def _atomic(path: Path, data: bytes, mode: int) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    tmpname = ''
    try:
        with tempfile.NamedTemporaryFile(dir=path.parent, prefix='.lego-write-', delete=False) as f:
            tmpname = f.name
            f.write(data)
            f.flush()
            os.fchmod(f.fileno(), mode)
            os.fsync(f.fileno())
        os.replace(tmpname, path)
        _sync_dir(path.parent)
    finally:
        if tmpname and os.path.lexists(tmpname):
            os.unlink(tmpname)


def _transaction_folder(root: Path) -> Path:
    return root / DIRNAME


def begin(root: Path) -> Path:
    directory = _transaction_folder(root)
    try:
        directory.mkdir(mode=0o700)
    except FileExistsError as e:
        raise TransactionRejected('Interrupted or concurrent installation. Run --recover before retrying') from e
    _sync_dir(root)
    return directory


def discard_empty(root: Path) -> None:
    """Discard a stage-only transaction. Never discard a transaction with a manifest."""
    directory = _transaction_folder(root)
    if directory.is_dir() and not directory.is_symlink() and not any(directory.iterdir()):
        directory.rmdir()
        _sync_dir(root)


def _read_manifest(root: Path) -> list[dict]:
    txn = _transaction_folder(root)
    if not txn.exists() or txn.is_symlink() or not txn.is_dir():
        raise TransactionRejected('No valid recovery transaction')
    if any(p.name != MANIFEST for p in txn.iterdir()):
        raise TransactionRejected('Unknown entries in transaction journal; manual inspection required')
    path = txn / MANIFEST
    if not path.exists():
        return []
    if path.is_symlink():
        raise TransactionRejected('Symlink transaction manifest')
    try:
        data = json.loads(path.read_text('utf-8'))
    except (OSError, UnicodeError, ValueError) as e:
        raise TransactionRejected('Unreadable transaction journal') from e
    if data.get('version') != 1 or not isinstance(data.get('files'), list):
        raise TransactionRejected('Invalid transaction journal structure')
    entries = data['files']
    if len(entries) > 200:
        raise TransactionRejected('Transaction journal contains too many files')
    paths = set()
    for entry in entries:
        if not isinstance(entry, dict) or not isinstance(entry.get('path'), str):
            raise TransactionRejected('Malformed transaction record')
        rel = _rel(entry['path'])
        if rel in paths:
            raise TransactionRejected('Duplicate transaction path')
        paths.add(rel)
        expected = entry.get('oldSha256')
        new = entry.get('newSha256')
        old64 = entry.get('oldBase64')
        if not isinstance(new, str) or not HEX.fullmatch(new):
            raise TransactionRejected('Invalid new hash')
        if expected is None:
            if old64 is not None:
                raise TransactionRejected('Unexpected backup for new file')
        elif not isinstance(expected, str) or not HEX.fullmatch(expected) or not isinstance(old64, str):
            raise TransactionRejected('Missing or invalid prior hash/backup')
        else:
            try:
                old = base64.b64decode(old64, validate=True)
            except (ValueError, Exception) as e:
                raise TransactionRejected('Invalid transaction backup') from e
            if digest(old) != expected:
                raise TransactionRejected('Backup checksum mismatch')
        mode = entry.get('oldMode')
        if mode is not None and (not isinstance(mode, int) or mode < 0 or mode > 0o777):
            raise TransactionRejected('Invalid backup mode')
    return entries


def recover(root: Path) -> list[str]:
    """Roll back only when every target equals its recorded old or new hash.

    A post-crash user edit causes a refusal instead of silently overwriting it.
    """
    entries = _read_manifest(root)
    if not entries:
        discard_empty(root)
        return []
    # Validate the whole transaction before mutating even one target.
    changes: list[tuple[Path, dict, bytes | None]] = []
    for entry in entries:
        rel = entry['path']
        path = _safe_file(root, rel)
        actual = path.read_bytes() if path.exists() else None
        current = digest(actual) if actual is not None else None
        prior = entry['oldSha256']
        if current not in (prior, entry['newSha256']):
            raise TransactionRejected('Consumer changed since interruption: '+rel)
        if prior is not None and actual is None:
            raise TransactionRejected('Previously existing consumer file was removed: '+rel)
        old = base64.b64decode(entry['oldBase64']) if prior is not None else None
        changes.append((path, entry, old))
    restored = []
    for path, entry, old in reversed(changes):
        if old is None:
            if path.exists():
                path.unlink()
                _sync_dir(path.parent)
            cursor = path.parent
            while cursor != root:
                try:
                    cursor.rmdir()
                    _sync_dir(cursor.parent)
                except OSError:
                    break
                cursor = cursor.parent
        else:
            if not path.exists() or digest(path.read_bytes()) != entry['oldSha256']:
                _atomic(path, old, entry.get('oldMode') or 0o644)
        restored.append(entry['path'])
    txn = _transaction_folder(root)
    (txn / MANIFEST).unlink()
    _sync_dir(txn)
    txn.rmdir()
    _sync_dir(root)
    return restored


def commit(root: Path, before: dict[str, bytes], after: dict[str, bytes]) -> list[str]:
    """Persist backups before first write, then replace target files atomically."""
    removed = set(before) - set(after)
    if removed:
        raise TransactionRejected('Installer attempted to delete inputs')
    changes = {path: data for path, data in after.items() if before.get(path) != data}
    if not changes:
        return []
    if len(changes) > 200:
        raise TransactionRejected('Too many changes in transaction')
    records = []
    total = 0
    for rel, value in sorted(changes.items()):
        path = _safe_file(root, rel)
        old = before.get(rel)
        if path.exists():
            if old is None or path.read_bytes() != old:
                raise TransactionRejected('Consumer modified during staging: '+rel)
        elif old is not None:
            raise TransactionRejected('Consumer file disappeared during staging: '+rel)
        total += len(old or b'')
        if total > MAX_BACKUP_BYTES:
            raise TransactionRejected('Transaction backup exceeds safe size limit')
        records.append({
            'path':rel,
            'oldSha256': digest(old) if old is not None else None,
            'oldBase64':base64.b64encode(old).decode('ascii') if old is not None else None,
            'oldMode':stat.S_IMODE(path.stat().st_mode) if old is not None else None,
            'newSha256':digest(value),
        })
    txn = _transaction_folder(root)
    if not txn.is_dir() or txn.is_symlink() or any(txn.iterdir()):
        raise TransactionRejected('Missing or dirty exclusive installation lock')
    manifest = json.dumps({'version':1,'files':records},sort_keys=True).encode('utf-8')
    _atomic(txn/MANIFEST,manifest,0o600)
    _sync_dir(txn)
    try:
        for index, (rel, value) in enumerate(sorted(changes.items()), 1):
            file = _safe_file(root, rel)
            oldmode = stat.S_IMODE(file.stat().st_mode) if file.exists() else 0o644
            _atomic(file, value, oldmode)
            if os.environ.get('LEGO_TEST_KILL_AFTER') == str(index):
                os.kill(os.getpid(), signal.SIGKILL)
            if os.environ.get('LEGO_TEST_FAIL_AFTER') == str(index):
                raise RuntimeError('Injected staging-to-consumer commit failure')
    except BaseException:
        recover(root)
        raise
    # All replacements are durable before removing the journal.
    (txn/MANIFEST).unlink()
    _sync_dir(txn)
    txn.rmdir()
    _sync_dir(root)
    return sorted(changes)
