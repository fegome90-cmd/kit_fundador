#!/bin/bash
# Basic validation tests for setup.sh

set -e
cd "$(dirname "$0")/../.."

echo "Running setup.sh validation tests..."

# Test 1: Script exists and is executable
if [ ! -x "scripts/setup.sh" ]; then
    echo "FAIL: setup.sh not found or not executable"
    exit 1
fi
echo "✓ setup.sh exists and is executable"

# Test 2: Template directories exist
for dir in templates/typescript templates/python; do
    if [ ! -d "$dir" ]; then
        echo "FAIL: $dir not found"
        exit 1
    fi
done
echo "✓ Template directories exist"

# Test 3: Key template files exist
for file in \
    templates/typescript/package.json \
    templates/typescript/tsconfig.json \
    templates/python/pyproject.toml \
    templates/typescript/src/domain/entities/User.ts \
    templates/python/src/domain/entities/user.py; do
    if [ ! -f "$file" ]; then
        echo "FAIL: $file not found"
        exit 1
    fi
done
echo "✓ Key template files exist"

echo "All validation tests passed!"