#!/usr/bin/env bash
# Experimental Docker filesystem-isolation smoke. Not a network isolation test.
set -euo pipefail
ROOT="$PWD"
LAB="$(mktemp -d)"
HTTP_PID=""
cleanup() {
  if [[ -n "$HTTP_PID" ]]; then kill "$HTTP_PID" 2>/dev/null || true; fi
  rm -rf "$LAB"
}
trap cleanup EXIT

docker image inspect kit-lego-sandbox:ci --format 'SANDBOX_IMAGE_ID {{.Id}}'
python3 registry.py
python3 -m http.server 4380 --bind 127.0.0.1 --directory registry > "$LAB/registry-http.log" 2>&1 &
HTTP_PID=$!
for i in $(seq 1 40); do
  if curl --silent --fail http://127.0.0.1:4380/core-fastify.json >/dev/null; then break; fi
  sleep 0.25
done
curl --silent --fail http://127.0.0.1:4380/core-fastify.json >/dev/null

CONSUMER="$LAB/sandbox-project"
mkdir "$CONSUMER"
printf '{"name":"lego-docker-sandbox","version":"0.0.0","private":true,"type":"module","packageManager":"pnpm@11.25.0"}\n' > "$CONSUMER/package.json"
cp prototype/pnpm-workspace.yaml "$CONSUMER/pnpm-workspace.yaml"

# A host-only canary file must not be visible from the container.
CANARY="$LAB/do-not-read-host-canary.txt"
printf 'HOST_SECRET_CANARY_SHOULD_NOT_BE_VISIBLE\n' > "$CANARY"
docker run --rm --read-only --cap-drop ALL \
  --security-opt=no-new-privileges --pids-limit 128 --memory=512m \
  --network host --user "$(id -u):$(id -g)" \
  --tmpfs /tmp:rw,nosuid,nodev,size=128m,mode=1777 \
  --mount "type=bind,src=$CONSUMER,dst=/work" \
  --workdir /work \
  kit-lego-sandbox:ci node -e '
    const fs=require("node:fs");
    const host=process.argv[1];
    if (fs.existsSync(host)) process.exit(88);
    try { fs.writeFileSync("/etc/lego-host-escape-probe","no"); process.exit(89); }
    catch (e) { if (!["EROFS","EACCES"].includes(e.code)) throw e; }
    fs.writeFileSync("/work/container-write-probe","ok");
  ' "$CANARY"
test "$(cat "$CONSUMER/container-write-probe")" = 'ok'
rm "$CONSUMER/container-write-probe"
echo "DOCKER_FILESYSTEM_BOUNDARY_PASS (network host intentionally shared)"

CLI="$ROOT/prototype/node_modules/shadcn/dist/index.js"
BASE="http://127.0.0.1:4380"

# Preview and diff operate on the same immutable in-memory snapshot.
python3 lego_safe.py --project "$CONSUMER" --registry "$BASE" \
  --items lego-full-a --preview --allow-http-localhost > "$LAB/preview.json"
python3 lego_safe.py --project "$CONSUMER" --registry "$BASE" \
  --items lego-full-a --diff --allow-http-localhost \
  --shadcn-cli "$CLI" --sandbox docker --sandbox-image kit-lego-sandbox:ci \
  > "$LAB/sandbox-diff.json"
test ! -e "$CONSUMER/src/server.ts"
python3 lego_safe.py --project "$CONSUMER" --registry "$BASE" \
  --items lego-full-a --install --allow-http-localhost \
  --shadcn-cli "$CLI" --sandbox docker --sandbox-image kit-lego-sandbox:ci \
  > "$LAB/sandbox-install.json"

(cd "$CONSUMER" &&
  pnpm install --frozen-lockfile --strict-peer-dependencies &&
  pnpm exec tsc --noEmit --skipLibCheck &&
  pnpm exec tsc --skipLibCheck)
node smoke.mjs "$CONSUMER" off off
python3 - "$LAB/sandbox-install.json" <<'PY'
import json,sys
result=json.load(open(sys.argv[1]))
assert result['mode']=='installed'
assert 'src/server.ts' in result['changes']
print('DOCKER_SHADCN_INSTALL_PASS',len(result['changes']))
PY

cp "$LAB/sandbox-diff.json" "$ROOT/registry-safety-docker-diff.json"
cp "$LAB/sandbox-install.json" "$ROOT/registry-safety-docker-install.json"
echo "DOCKER_SANDBOX_LAB_PASS (filesystem/process containment only)"
