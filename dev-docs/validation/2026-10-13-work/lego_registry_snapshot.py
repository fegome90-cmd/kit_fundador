"""Frozen, verifiable registry payloads for the experimental LEGO installer.

Each item is downloaded exactly once; the installer sees only the verified,
in-memory snapshot served over a temporary localhost HTTP endpoint.
A version-locked digest manifest is required for non-loopback origins.

This protects against *registry content changing mid-command*, not against
a malicious but correctly pinned registry item or npm lifecycle scripts.
"""
from __future__ import annotations

import hashlib
import json
import re
import threading
from contextlib import contextmanager
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlsplit

ID = re.compile(r"^[a-z][a-z0-9-]{0,63}$")
SHA = re.compile(r"^[a-f0-9]{64}$")


class RegistryIntegrityError(ValueError):
    pass


def load_lock(path: str | None, origin: str, source_hashes: dict[str, str], *,
              local_lab_mode: bool) -> None:
    if path is None:
        if local_lab_mode:
            return
        raise RegistryIntegrityError(
            "Remote registry requires an independently reviewed --registry-lock "
            "with SHA-256 hashes; branches/latest are not accepted"
        )
    try:
        content = json.loads(Path(path).read_text("utf-8"))
    except (OSError, UnicodeError, ValueError) as e:
        raise RegistryIntegrityError("Unreadable registry lockfile") from e
    if not isinstance(content, dict) or content.get("version") != 1 or content.get("origin") != origin:
        raise RegistryIntegrityError("Registry lockfile origin/version mismatch")
    pinned = content.get("items")
    if not isinstance(pinned, dict) or not pinned:
        raise RegistryIntegrityError("Registry lockfile items missing")
    for name, value in pinned.items():
        if not isinstance(name, str) or not ID.fullmatch(name) or not isinstance(value, str) or not SHA.fullmatch(value):
            raise RegistryIntegrityError("Invalid registry lockfile entry")
    for name, actual in source_hashes.items():
        expected = pinned.get(name)
        if expected != actual:
            raise RegistryIntegrityError(
                f"Registry item checksum mismatch: {name}: "
                f"expected {expected or '[missing]'}, observed {actual}"
            )


def source_digest(raw: bytes) -> str:
    return hashlib.sha256(raw).hexdigest()


class _RegistryServer(ThreadingHTTPServer):
    daemon_threads = True
    allow_reuse_address = False

    def __init__(self, items: dict[str, bytes], *, bind_address: str):
        self.payloads = items
        super().__init__((bind_address, 0), _Handler)


class _Handler(BaseHTTPRequestHandler):
    def log_message(self, *_args):
        return

    def do_HEAD(self):
        self._serve(head=True)

    def do_GET(self):
        self._serve(head=False)

    def _serve(self, *, head: bool):
        path = urlsplit(self.path)
        # Only allow the names that were validated in the frozen closure.
        payload = self.server.payloads.get(path.path)
        if payload is None or path.query or path.fragment:
            self.send_error(404, "Not found")
            return
        self.send_response(200)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Cache-Control", "no-store")
        self.send_header("Content-Length", str(len(payload)))
        self.end_headers()
        if not head:
            self.wfile.write(payload)


@contextmanager
def frozen_registry(items: list[dict], source_origin: str, *, bind_address='127.0.0.1', advertise_host=None):
    """Serve a consistent content snapshot and rewrite *only* closure links.

    The items are already vetted by lego_safe.fetch_registry, including file
    targets and dependency closure. Do not serve unvalidated input here.
    """
    server = _RegistryServer({},bind_address=bind_address)
    thread = threading.Thread(target=server.serve_forever, name="lego-frozen-registry", daemon=True)
    local_base = f"http://{advertise_host or bind_address}:{server.server_port}"
    payloads = {}
    try:
        for item in items:
            name = item["name"]
            if not isinstance(name, str) or not ID.fullmatch(name):
                raise RegistryIntegrityError("Invalid frozen item name")
            body = dict(item)
            translated = []
            for uri in body.get("registryDependencies", []):
                prefix = source_origin + "/"
                if not isinstance(uri, str) or not uri.startswith(prefix) or not uri.endswith(".json"):
                    raise RegistryIntegrityError("Unvalidated frozen dependency")
                dep = uri[len(prefix):-5]
                if not ID.fullmatch(dep):
                    raise RegistryIntegrityError("Invalid frozen dependency name")
                translated.append(local_base + "/" + dep + ".json")
            body["registryDependencies"] = translated
            payloads[f"/{name}.json"] = json.dumps(
                body, separators=(",", ":"), ensure_ascii=False, sort_keys=True
            ).encode("utf-8")
        server.payloads = payloads
        thread.start()
        yield local_base
    finally:
        if thread.is_alive():
            server.shutdown()
            thread.join(timeout=5)
        server.server_close()
