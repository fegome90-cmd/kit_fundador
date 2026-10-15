"""Restricted Docker invocation for experimental LEGO shadcn installations.

IMPORTANT: The lab uses --network host to reach its ephemeral frozen registry.
This restricts filesystem visibility and process privileges but does NOT
isolate network access to local services. No release security claim follows.
"""
from __future__ import annotations

import os
from pathlib import Path
import re
import secrets
import subprocess


class SandboxRejected(ValueError):
    pass


IMAGE = re.compile(r"^[a-zA-Z0-9_.:/@-]{1,180}$")


def docker_install(stage: Path, cli: Path, urls: list[str], *, image: str,
                   timeout: int = 180) -> subprocess.CompletedProcess:
    if os.name != "posix" or not hasattr(os, "getuid"):
        raise SandboxRejected("Docker lab currently supports POSIX Linux only")
    if not IMAGE.fullmatch(image):
        raise SandboxRejected("Invalid Docker sandbox image")
    if not stage.is_dir():
        raise SandboxRejected("Missing staging project")
    cli = cli.resolve(strict=True)
    # pnpm's shadcn symlink resolves into the shared .pnpm store.
    # Mount only node_modules (read-only), NOT the repository or user's HOME.
    node_modules = next((p for p in cli.parents
                         if p.name == "node_modules" and (p / ".pnpm").is_dir()), None)
    if node_modules is None:
        raise SandboxRejected("shadcn CLI must resolve under pnpm node_modules")
    relative = cli.relative_to(node_modules).as_posix()
    name = "lego-install-" + secrets.token_hex(8)
    command = [
        "docker", "run", "--rm", "--name", name,
        "--read-only", "--cap-drop=ALL", "--security-opt=no-new-privileges",
        "--pids-limit=192", "--memory=1024m", "--cpus=2",
        # LAB ONLY: host network allows the container to contact the local
        # frozen registry and npm. It is NOT a network security boundary.
        "--network=host",
        "--user", f"{os.getuid()}:{os.getgid()}",
        "--tmpfs", "/tmp:rw,nosuid,nodev,size=384m,mode=1777",
        "--mount", f"type=bind,src={stage.resolve()},dst=/work",
        "--mount", f"type=bind,src={node_modules},dst=/deps/node_modules,readonly",
        "--workdir=/work",
        "-e", "HOME=/tmp",
        "-e", "XDG_CONFIG_HOME=/tmp/config",
        "-e", "XDG_CACHE_HOME=/tmp/cache",
        "-e", "npm_config_userconfig=/tmp/.npmrc",
        "-e", "CI=true",
        "-e", "NO_PROXY=localhost,127.0.0.1",
        "-e", "no_proxy=localhost,127.0.0.1",
        "-e", "npm_config_registry=https://registry.npmjs.org",
        image, "node", "/deps/node_modules/" + relative,
        "add", *urls, "--yes"
    ]
    # Docker requests are deterministic arrays, never shell interpolation.
    # The Docker socket is not mounted, nor is the host checkout/HOME.
    environment = {
        k: v for k, v in os.environ.items()
        if k in {"PATH", "HOME", "DOCKER_HOST", "DOCKER_CONTEXT", "DOCKER_CONFIG"}
    }
    try:
        return subprocess.run(command, cwd=stage, env=environment,
                              capture_output=True, text=True, timeout=timeout)
    except subprocess.TimeoutExpired:
        # A killed Docker CLI might leave a live container; force-remove by
        # the random name and then fail closed.
        subprocess.run(["docker", "rm", "-f", name], capture_output=True,
                       text=True, timeout=20)
        raise
