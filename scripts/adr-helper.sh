#!/bin/bash
# ADR Helper Script - Kit Fundador v2.0
# Provides utilities for ADR management

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

ADR_DIR="dev-docs/ADR"
TEMPLATE_FILE="$ADR_DIR/ADR_TEMPLATE_AND_GUIDE.md"
DECISION_MATRIX="$ADR_DIR/ADR_DECISION_MATRIX.md"

# Function to display help
help() {
    echo -e "${BLUE}ADR Helper - Kit Fundador v2.0${NC}"
    echo ""
    echo "Usage: $0 [command] [options]"
    echo ""
    echo "Commands:"
    echo "  list              List all ADRs"
    echo "  search <term>     Search ADRs by keyword"
    echo "  create            Create new ADR (interactive)"
    echo "  next-id           Get next ADR number"
    echo "  validate <file>   Validate ADR format"
    echo "  check-required     Check if ADR is required for current changes"
    echo "  help              Show this help"
    echo ""
    echo "Examples:"
    echo "  $0 list                    # List all ADRs"
    echo "  $0 search database        # Search for 'database' in ADRs"
    echo "  $0 create                  # Interactive ADR creation"
    echo "  $0 validate ADR-015*.md  # Validate ADR format"
}

# Function to list all ADRs
list_adrs() {
    echo -e "${GREEN}All Architecture Decision Records:${NC}"
    echo ""

    if [ ! -d "$ADR_DIR" ]; then
        echo -e "${RED}Error: ADR directory not found ($ADR_DIR)${NC}"
        exit 1
    fi

    # Find and sort ADRs
    find "$ADR_DIR" -name "ADR-*.md" -type f | sort | while read -r file; do
        basename "$file"
        # Extract ID and title
        id=$(basename "$file" .md | cut -d'-' -f1)
        title=$(basename "$file" .md | cut -d'-' -f2- | sed 's/-/ /g' | sed 's/\b\w/\u&/g')
        echo -e "  ${YELLOW}$id${NC}: $title"
    done

    echo ""
    echo -e "${BLUE}Total: $(find "$ADR_DIR" -name "ADR-*.md" -type f | wc -l | tr -d ' ') ADRs${NC}"
}

# Function to search ADRs
search_adrs() {
    local term="$1"
    if [ -z "$term" ]; then
        echo -e "${RED}Error: Search term required${NC}"
        echo "Usage: $0 search <term>"
        exit 1
    fi

    echo -e "${GREEN}Searching ADRs for '$term':${NC}"
    echo ""

    find "$ADR_DIR" -name "ADR-*.md" -type f | while read -r file; do
        if grep -i "$term" "$file" > /dev/null 2>&1; then
            basename "$file"
            # Show matching lines with context
            echo -e "${YELLOW}  Matches:${NC}"
            grep -i -n -C 2 "$term" "$file" | sed 's/^/    /'
            echo ""
        fi
    done
}

# Function to get next ADR ID
next_id() {
    if [ ! -d "$ADR_DIR" ]; then
        echo "001"
        return
    fi

    # Find highest ADR number
    highest=$(find "$ADR_DIR" -name "ADR-*.md" -type f | \
               sed 's/.*ADR-0*\([0-9]*\).*/\1/' | \
               sort -n | \
               tail -1)

    if [ -z "$highest" ]; then
        echo "001"
    else
        # Format with leading zeros
        printf "%03d" $((highest + 1))
    fi
}

# Function to create new ADR (interactive)
create_adr() {
    local id=$(next_id)
    echo -e "${GREEN}Creating new ADR${NC}"
    echo -e "${BLUE}Next ADR ID: $id${NC}"
    echo ""

    # Get title
    read -p "ADR Title (short, descriptive): " title
    if [ -z "$title" ]; then
        echo -e "${RED}Error: Title is required${NC}"
        exit 1
    fi

    # Convert title to filename format
    filename_title=$(echo "$title" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9 ]/-/g' | tr -s ' '-' | sed 's/^-//; s/-$//')
    filename="ADR-$id-$filename_title.md"
    filepath="$ADR_DIR/$filename"

    echo -e "${BLUE}Creating file: $filepath${NC}"
    echo ""

    # Create ADR from template
    if [ -f "$TEMPLATE_FILE" ]; then
        # Extract template part between YAML markers
        sed -n '/```yaml/,/```/p' "$TEMPLATE_FILE" | \
        sed '1d;$d' | \
        sed "s/ADR-XXX/ADR-$id/g" | \
        sed "s/Título Descriptivo y Conciso de la Decisión Arquitectónica/$title/g" | \
        sed "s/\"proposed\"/\"proposed\"/g" | \
        sed "s/\"\$date\"/\"$(date +%Y-%m-%d)\"/g" | \
        sed "s/\"Nombre del Autor\"/\"$(git config user.name 2>/dev/null || echo 'Author')\"/g" > "$filepath"

        # Add markdown sections
        echo "" >> "$filepath"
        echo "# $title" >> "$filepath"
        echo "" >> "$filepath"
        echo "## Context" >> "$filepath"
        echo "" >> "$filepath"
        echo "## Decision" >> "$filepath"
        echo "" >> "$filepath"
        echo "## Consequences" >> "$filepath"

        echo -e "${GREEN}✅ ADR created successfully!${NC}"
        echo -e "${YELLOW}File: $filepath${NC}"
        echo ""
        echo -e "${BLUE}Next steps:${NC}"
        echo "1. Edit the ADR file to complete Context, Decision, and Consequences sections"
        echo "2. Consult $DECISION_MATRIX for decision requirements"
        echo "3. Update $ADR_DIR/ADR_INDEX.md to include the new ADR"

        # Open in default editor if available
        if command -v code >/dev/null 2>&1; then
            echo "Opening in VS Code..."
            code "$filepath"
        elif command -v nano >/dev/null 2>&1; then
            echo "Opening in nano..."
            nano "$filepath"
        else
            echo "Edit the file manually: $filepath"
        fi
    else
        echo -e "${RED}Error: Template file not found ($TEMPLATE_FILE)${NC}"
        exit 1
    fi
}

# Function to validate ADR format
validate_adr() {
    local file="$1"
    if [ -z "$file" ]; then
        echo -e "${RED}Error: ADR file required${NC}"
        echo "Usage: $0 validate <ADR-file>"
        exit 1
    fi

    if [ ! -f "$file" ]; then
        echo -e "${RED}Error: File not found ($file)${NC}"
        exit 1
    fi

    echo -e "${GREEN}Validating ADR: $file${NC}"
    echo ""

    # Check for required sections
    local errors=0

    # Check YAML frontmatter
    if ! grep -q "^id: ADR-" "$file"; then
        echo -e "${RED}❌ Missing or invalid id in YAML frontmatter${NC}"
        errors=$((errors + 1))
    fi

    if ! grep -q "^title:" "$file"; then
        echo -e "${RED}❌ Missing title in YAML frontmatter${NC}"
        errors=$((errors + 1))
    fi

    if ! grep -q "^status:" "$file"; then
        echo -e "${RED}❌ Missing status in YAML frontmatter${NC}"
        errors=$((errors + 1))
    fi

    # Check required markdown sections
    if ! grep -q "^## Context$" "$file"; then
        echo -e "${RED}❌ Missing Context section${NC}"
        errors=$((errors + 1))
    fi

    if ! grep -q "^## Decision$" "$file"; then
        echo -e "${RED}❌ Missing Decision section${NC}"
        errors=$((errors + 1))
    fi

    if ! grep -q "^## Consequences$" "$file"; then
        echo -e "${RED}❌ Missing Consequences section${NC}"
        errors=$((errors + 1))
    fi

    if [ $errors -eq 0 ]; then
        echo -e "${GREEN}✅ ADR format is valid!${NC}"
    else
        echo -e "${RED}❌ Found $errors validation errors${NC}"
        echo ""
        echo -e "${BLUE}Consult $TEMPLATE_FILE for proper format${NC}"
        exit 1
    fi
}

# Function to check if ADR is required
check_adr_required() {
    echo -e "${GREEN}Checking if ADR is required for current changes...${NC}"
    echo ""

    # Check git status for changed files
    if ! command -v git >/dev/null 2>&1 || [ ! -d ".git" ]; then
        echo -e "${YELLOW}Warning: Not in a git repository${NC}"
        echo -e "${BLUE}Manual check:${NC} Consult $DECISION_MATRIX to determine if ADR is required"
        return
    fi

    local changes=$(git status --porcelain)
    if [ -z "$changes" ]; then
        echo -e "${YELLOW}No changes detected${NC}"
        return
    fi

    echo -e "${BLUE}Files changed:${NC}"
    echo "$changes"
    echo ""

    # Analyze changes for architectural impact
    local architectural_changes=0

    # Check for package.json changes (technology stack)
    if echo "$changes" | grep -q "package.json"; then
        echo -e "${YELLOW}🔧 Technology stack changes detected${NC}"
        echo -e "${BLUE}→ ADR likely required (see ADR_DECISION_MATRIX.md)${NC}"
        architectural_changes=$((architectural_changes + 1))
    fi

    # Check for Docker changes (infrastructure)
    if echo "$changes" | grep -q -E "(docker-compose|Dockerfile)"; then
        echo -e "${YELLOW}🗄️ Infrastructure changes detected${NC}"
        echo -e "${BLUE}→ ADR likely required (see ADR_DECISION_MATRIX.md)${NC}"
        architectural_changes=$((architectural_changes + 1))
    fi

    # Check for domain layer changes
    if echo "$changes" | grep -q "src/domain"; then
        echo -e "${YELLOW}🏗️ Domain architecture changes detected${NC}"
        echo -e "${BLUE}→ ADR may be required (see ADR_DECISION_MATRIX.md)${NC}"
        architectural_changes=$((architectural_changes + 1))
    fi

    # Check for API/interface changes
    if echo "$changes" | grep -q -E "(api|routes|controllers)"; then
        echo -e "${YELLOW}🔌 API changes detected${NC}"
        echo -e "${BLUE}→ ADR may be required (see ADR_DECISION_MATRIX.md)${NC}"
        architectural_changes=$((architectural_changes + 1))
    fi

    echo ""
    if [ $architectural_changes -gt 0 ]; then
        echo -e "${RED}⚠️ Architectural changes detected!${NC}"
        echo -e "${BLUE}Next steps:${NC}"
        echo "1. Consult $DECISION_MATRIX for ADR requirements"
        echo "2. Search existing ADRs: $0 search <keyword>"
        echo "3. Create ADR if required: $0 create"
    else
        echo -e "${GREEN}✅ No architectural changes detected${NC}"
        echo -e "${BLUE}ADR likely not required for these changes${NC}"
    fi
}

# Main command routing
case "${1:-help}" in
    list)
        list_adrs
        ;;
    search)
        search_adrs "$2"
        ;;
    create)
        create_adr
        ;;
    next-id)
        next_id
        ;;
    validate)
        validate_adr "$2"
        ;;
    check-required)
        check_adr_required
        ;;
    help|--help|-h)
        help
        ;;
    *)
        echo -e "${RED}Unknown command: $1${NC}"
        echo ""
        help
        exit 1
        ;;
esac