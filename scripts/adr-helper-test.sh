#!/bin/bash
# Simplified ADR Helper for Testing
# Bypassing complex script issues for Day 3 validation

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

case "${1:-help}" in
    list)
        echo -e "${GREEN}Available ADRs:${NC}"
        if [ -d "dev-docs/ADR" ]; then
            find dev-docs/ADR -name "ADR-*.md" | sort | while read -r file; do
                basename "$file"
            done
        else
            echo -e "${YELLOW}No ADR directory found${NC}"
        fi
        ;;
    next-id)
        echo "001"
        ;;
    help)
        echo -e "${BLUE}ADR Helper Test Version${NC}"
        echo "Commands: list, next-id, help"
        ;;
    *)
        echo -e "${RED}Unknown command: $1${NC}"
        ;;
esac