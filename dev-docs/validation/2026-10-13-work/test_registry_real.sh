#!/usr/bin/env bash
set -euo pipefail
ROOT="$PWD"
LAB="$(mktemp -d)"
HTTP_PID=""
cleanup() {
  if [[ -n "$HTTP_PID" ]]; then kill "$HTTP_PID" 2>/dev/null || true; fi
  rm -rf "$LAB"
}
trap cleanup EXIT

python3 registry.py
python3 -m http.server 4380 --bind 127.0.0.1 --directory registry > "$LAB/http.log" 2>&1 &
HTTP_PID=$!
for i in $(seq 1 40); do
  if curl --silent --fail http://127.0.0.1:4380/core-fastify.json >/dev/null; then break; fi
  sleep 0.25
done
curl --silent --fail http://127.0.0.1:4380/core-fastify.json >/dev/null
BASE="http://127.0.0.1:4380"
CLI="$ROOT/prototype/node_modules/shadcn/dist/index.js"

bootstrap() {
  local folder="$1"
  local name="$2"
  mkdir -p "$folder"
  printf '{"name":"%s","version":"0.0.0","private":true,"type":"module","packageManager":"pnpm@11.25.0"}\n' "$name" > "$folder/package.json"
  cp prototype/pnpm-workspace.yaml "$folder/pnpm-workspace.yaml"
}

for variant in a b; do
  CONSUMER="$LAB/consumer-$variant"
  bootstrap "$CONSUMER" "lego-safe-$variant"
  before=$(sha256sum "$CONSUMER/package.json" | cut -d' ' -f1)
  python3 lego_safe.py --project "$CONSUMER" --registry "$BASE" --items "lego-full-$variant" --preview --allow-http-localhost > "$LAB/preview-$variant.json"
  after=$(sha256sum "$CONSUMER/package.json" | cut -d' ' -f1)
  test "$before" = "$after"
  test ! -d "$CONSUMER/src"
  python3 - "$LAB/preview-$variant.json" <<'PY'
import json,sys
d=json.load(open(sys.argv[1]))
assert d["writes"]==0 and d["mode"]=="preview"
print("SAFE_PREVIEW_PASS",d["items"],len(d["files"]))
PY
  python3 lego_safe.py --project "$CONSUMER" --registry "$BASE" --items "lego-full-$variant" --diff --allow-http-localhost --shadcn-cli "$CLI" > "$LAB/diff-$variant.json"
  python3 - "$LAB/diff-$variant.json" <<'PY'
import json,sys
d=json.load(open(sys.argv[1]))
assert d['mode']=='diff' and d['writes']==0
paths={p['path'] for p in d['patches']}
assert {'package.json','pnpm-lock.yaml','src/server.ts'}.issubset(paths),paths
print('SAFE_STAGED_DIFF_PASS',len(paths))
PY
  after=$(sha256sum "$CONSUMER/package.json" | cut -d' ' -f1)
  test "$before" = "$after"
  python3 lego_safe.py --project "$CONSUMER" --registry "$BASE" --items "lego-full-$variant" --install --allow-http-localhost --shadcn-cli "$CLI" > "$LAB/install-$variant.json"
  (cd "$CONSUMER" && pnpm install --frozen-lockfile --strict-peer-dependencies && pnpm exec tsc --noEmit --skipLibCheck && pnpm exec tsc --skipLibCheck)
  node smoke.mjs "$CONSUMER" off off
  # Reinstall the same recipe; it must not rewrite consumer-owned content.
  before=$(sha256sum "$CONSUMER/package.json" "$CONSUMER/pnpm-lock.yaml" "$CONSUMER/src/server.ts" | sha256sum | cut -d' ' -f1)
  python3 lego_safe.py --project "$CONSUMER" --registry "$BASE" --items "lego-full-$variant" --install --allow-http-localhost --shadcn-cli "$CLI" > "$LAB/repeat-$variant.json"
  after=$(sha256sum "$CONSUMER/package.json" "$CONSUMER/pnpm-lock.yaml" "$CONSUMER/src/server.ts" | sha256sum | cut -d' ' -f1)
  test "$before" = "$after"
  echo "SAFE_IDEMPOTENCE_PASS $variant"
  echo "SAFE_REAL_SHADCN_PASS $variant"
done

CONFLICT="$LAB/conflict"
bootstrap "$CONFLICT" lego-conflict
before=$(sha256sum "$CONFLICT/package.json" | cut -d' ' -f1)
if python3 lego_safe.py --project "$CONFLICT" --registry "$BASE" --items jobs-postgres jobs-valkey --install --allow-http-localhost --shadcn-cli "$CLI" > "$LAB/conflict.log" 2>&1; then
  echo "ERROR: incompatible jobs accepted" >&2
  exit 1
fi
after=$(sha256sum "$CONFLICT/package.json" | cut -d' ' -f1)
test "$before" = "$after"
test ! -e "$CONFLICT/src/backend.ts"
echo SAFE_EXCLUSIVITY_PASS

ROLLBACK="$LAB/rollback"
bootstrap "$ROLLBACK" lego-rollback
before=$(sha256sum "$ROLLBACK/package.json" "$ROLLBACK/pnpm-workspace.yaml" | sha256sum | cut -d' ' -f1)
if LEGO_TEST_FAIL_AFTER=2 python3 lego_safe.py --project "$ROLLBACK" --registry "$BASE" --items api-docs --install --allow-http-localhost --shadcn-cli "$CLI" > "$LAB/rollback.log" 2>&1; then
  echo "ERROR: injected failure did not fail" >&2
  exit 1
fi
after=$(sha256sum "$ROLLBACK/package.json" "$ROLLBACK/pnpm-workspace.yaml" | sha256sum | cut -d' ' -f1)
test "$before" = "$after"
test ! -e "$ROLLBACK/src/docs.ts"
test ! -e "$ROLLBACK/pnpm-lock.yaml"
echo "SAFE_ROLLBACK_PASS (injected synchronous failure)"

cp "$LAB/preview-a.json" "$ROOT/registry-safety-preview-a.json"
cp "$LAB/preview-b.json" "$ROOT/registry-safety-preview-b.json"
cp "$LAB/diff-a.json" "$ROOT/registry-safety-diff-a.json"
cp "$LAB/diff-b.json" "$ROOT/registry-safety-diff-b.json"
cp "$LAB/install-a.json" "$ROOT/registry-safety-install-a.json"
cp "$LAB/install-b.json" "$ROOT/registry-safety-install-b.json"
echo "SAFE_REGISTRY_END_TO_END_PASS"
