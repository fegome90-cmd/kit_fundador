#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
TMP_ROOT=$(mktemp -d "${TMPDIR:-/tmp}/setup-sh-tests-XXXXXX")
trap 'rm -rf "$TMP_ROOT"' EXIT

tar_copy_repo() {
    local workdir
    workdir=$(mktemp -d "$TMP_ROOT/work-XXXXXX")
    tar -cf - \
        --exclude='.git' \
        --exclude='node_modules' \
        --exclude='venv' \
        -C "$ROOT_DIR" . | tar -xf - -C "$workdir"
    echo "$workdir"
}

assert_file() {
    local file=$1
    if [[ ! -f $file ]]; then
        echo "❌ Falta el archivo esperado: $file" >&2
        exit 1
    fi
}

assert_json_language() {
    local expected=$1
    local file=$2
    python3 - <<'PY' "$expected" "$file"
import json
import sys

expected = sys.argv[1]
file_path = sys.argv[2]
with open(file_path, 'r', encoding='utf-8') as fh:
    data = json.load(fh)
if data.get('language') != expected:
    raise SystemExit(f"language mismatch: {data.get('language')} != {expected}")
PY
}

run_setup_option() {
    local option=$1
    local dir
    dir=$(tar_copy_repo)
    pushd "$dir" > /dev/null
    local log="$dir/setup-${option}.log"
    if ! SETUP_SH_SKIP_INSTALLS=true bash scripts/setup.sh --force > "$log" 2>&1 <<EOF
$option
1
EOF
    then
        cat "$log" >&2
        exit 1
    fi
    popd > /dev/null
    echo "$dir"
}

test_typescript_setup() {
    local dir
    dir=$(run_setup_option 1)
    pushd "$dir" > /dev/null
    assert_file package.json
    assert_file config/tech-stack.json
    assert_file .context/project-state.json
    assert_file src/domain/entities/User.ts
    python3 -m json.tool .context/project-state.json > /dev/null
    assert_json_language "typescript" .context/project-state.json
    popd > /dev/null
    echo "✓ TypeScript setup verificado"
}

test_python_setup() {
    local dir
    dir=$(run_setup_option 2)
    pushd "$dir" > /dev/null
    assert_file pyproject.toml
    assert_file requirements.txt
    assert_file .context/project-state.json
    assert_file venv/bin/activate
    python3 -m json.tool .context/project-state.json > /dev/null
    assert_json_language "python" .context/project-state.json
    popd > /dev/null
    echo "✓ Python setup verificado"
}

test_json_setup_and_compose_warning() {
    local dir
    dir=$(tar_copy_repo)
    rm -f "$dir/docker-compose.dev.yml"
    pushd "$dir" > /dev/null
    local log="$dir/setup-generic.log"
    if ! SETUP_SH_SKIP_INSTALLS=true bash scripts/setup.sh --force > "$log" 2>&1 <<'EOF'
3
1
EOF
    then
        cat "$log" >&2
        exit 1
    fi
    assert_file config/tech-stack.json
    assert_file src/domain/entities/.gitkeep
    assert_file tests/unit/.gitkeep
    python3 -m json.tool .context/project-state.json > /dev/null
    assert_json_language "generic" .context/project-state.json
    if ! grep -q 'docker-compose.dev.yml no encontrado' "$log"; then
        echo "❌ No se imprimió la advertencia por falta de docker-compose.dev.yml" >&2
        cat "$log" >&2
        exit 1
    fi
    popd > /dev/null
    echo "✓ JSON setup y advertencia de docker-compose verificados"
}

main() {
    test_typescript_setup
    test_python_setup
    test_json_setup_and_compose_warning
    echo "\nTodas las rutas de scripts/setup.sh se ejecutaron correctamente."
}

main "$@"
