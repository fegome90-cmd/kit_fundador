# ADR Usage Guide

## Overview

This guide provides comprehensive instructions for using the Architecture Decision Records (ADR) system in Kit Fundador v2.0.

## Quick Start

### For New Team Members

```bash
# 1. Understand the ADR system
cat dev-docs/ADR/ADR_TEMPLATE_AND_GUIDE.md

# 2. Check when ADRs are required
cat dev-docs/ADR/ADR_DECISION_MATRIX.md

# 3. Learn the workflow
cat dev-docs/ADR/ADR_WORKFLOW.md

# 4. See existing ADRs
./scripts/adr-reference-checker.sh list
```

### For Daily Architectural Decisions

```bash
# Before implementing, check if ADR is required:
./scripts/adr-helper.sh check-required

# Search for relevant existing ADRs:
./scripts/adr-reference-checker.sh check-keyword "database"

# Create new ADR if needed:
./scripts/adr-helper.sh create

# Reference ADR in your work:
git commit -m "feat: implement user auth (ADR-002)"
```

## Complete Workflow

### Phase 1: Decision Identification

1. **Recognize Architectural Decision**
   ```bash
   # Ask yourself:
   - Does this affect the system architecture?
   - Does this change the technology stack?
   - Does this impact multiple layers?
   - Will this affect future development?
   ```

2. **Check ADR Requirements**
   ```bash
   # Consult the decision matrix:
   cat dev-docs/ADR/ADR_DECISION_MATRIX.md

   # Use the helper tool:
   ./scripts/adr-helper.sh check-required
   ```

3. **Search Existing ADRs**
   ```bash
   # Find relevant ADRs:
   ./scripts/adr-reference-checker.sh check-keyword "search-term"

   # List all ADRs:
   ./scripts/adr-reference-checker.sh list
   ```

### Phase 2: ADR Creation (If Required)

1. **Create New ADR**
   ```bash
   # Interactive creation:
   ./scripts/adr-helper.sh create

   # Follow the template structure
   # Reference ADR_TEMPLATE_AND_GUIDE.md
   ```

2. **Complete All Sections**
   ```markdown
   Required Sections:
   - Context: Why this decision is needed
   - Decision: What was decided
   - Consequences: Positive and negative impacts

   Optional but Recommended:
   - Alternatives considered
   - Implementation details
   - Success metrics
   ```

3. **Validate ADR Format**
   ```bash
   # Check format compliance:
   ./scripts/adr-helper.sh validate ADR-XXX-filename.md
   ```

### Phase 3: Integration

1. **Update Index**
   ```bash
   # Add to ADR_INDEX.md:
   # Update categories and status
   # Add keywords for search
   # Include reference links
   ```

2. **Reference in Implementation**
   ```bash
   # In commits:
   git commit -m "feat: implement caching layer (ADR-003)"

   # In code comments:
   // Caching strategy per ADR-003
   // Redis chosen over Memcached for persistence

   # In PR descriptions:
   implements ADR-003: Redis caching layer
   ```

## Role-Specific Instructions

### For EJECUTOR (Implementation Agent)

```bash
# Pre-implementation workflow:
1. ./scripts/adr-helper.sh check-required
2. ./scripts/adr-reference-checker.sh check-keyword <topic>
3. ./scripts/adr-helper.sh create (if needed)
4. Reference ADR in commit messages
5. ./scripts/adr-helper.sh validate <adr-file>
```

**Required Actions:**
- [ ] Check ADR decision matrix before coding
- [ ] Search existing ADRs for similar decisions
- [ ] Create ADR if decision requires documentation
- [ ] Reference ADR in implementation
- [ ] Validate ADR format
- [ ] Update task.md with ADR reference

### For VALIDADOR (Review Agent)

```bash
# Pre-review workflow:
1. ./scripts/adr-helper.sh check-required
2. Find ADR references in changes
3. ./scripts/adr-helper.sh validate <adr-files>
4. Check cross-reference consistency
5. Verify ADR_INDEX.md is updated
```

**Required Checks:**
- [ ] Architectural changes have required ADRs
- [ ] ADRs follow template format
- [ ] ADRs are properly referenced
- [ ] Cross-references are consistent
- [ ] Documentation is up-to-date

### For Product Owner

```bash
# Decision support workflow:
1. ./scripts/adr-reference-checker.sh list
2. Review ADR completeness
3. Approve or request revisions
4. Monitor ADR adoption rate
```

**Oversight Responsibilities:**
- [ ] Ensure ADR process is followed
- [ ] Review significant architectural ADRs
- [ ] Track ADR effectiveness metrics
- [ ] Update ADR_DECISION_MATRIX.md as needed

## Command Reference

### adr-helper.sh Commands

```bash
./scripts/adr-helper.sh help
# Show all available commands

./scripts/adr-helper.sh list
# List all existing ADRs

./scripts/adr-helper.sh create
# Create new ADR interactively

./scripts/adr-helper.sh next-id
# Get next ADR number

./scripts/adr-helper.sh validate <file>
# Validate ADR format

./scripts/adr-helper.sh check-required
# Check if ADR required for current changes
```

### adr-reference-checker.sh Commands

```bash
./scripts/adr-reference-checker.sh list
# List all ADRs with context

./scripts/adr-reference-checker.sh check-keyword <term>
# Search ADRs by keyword

./scripts/adr-reference-checker.sh suggest "<task>"
# Get ADR suggestions for common tasks

./scripts/adr-reference-checker.sh current-task
# Check ADRs for current git changes
```

## Examples

### Example 1: Database Selection

```bash
# Decision: Choose between PostgreSQL and MongoDB

# 1. Check if ADR required:
./scripts/adr-helper.sh check-required
# Output: "Technology stack change detected → ADR REQUIRED"

# 2. Search existing ADRs:
./scripts/adr-reference-checker.sh check-keyword "database"
# Output: "No ADRs found for 'database'"

# 3. Create ADR:
./scripts/adr-helper.sh create
# Follow prompts to create ADR-002-database-selection.md

# 4. Reference in implementation:
git commit -m "feat: implement PostgreSQL persistence (ADR-002)"
```

### Example 2: API Design

```bash
# Decision: REST vs GraphQL

# 1. Search ADRs:
./scripts/adr-reference-checker.sh check-keyword "api"
# Output: "No ADRs found for 'api'"

# 2. Check requirements:
cat dev-docs/ADR/ADR_DECISION_MATRIX.md
# Output: "API Design: ADR MAYBE"

# 3. Create ADR:
./scripts/adr-helper.sh create
# Title: "REST API Design"

# 4. Implementation reference:
// API endpoints designed per ADR-003
// GraphQL rejected due to caching complexity
```

## Best Practices

### ADR Creation

1. **Be Specific**: Clearly state what was decided and why
2. **Include Context**: Explain the problem and alternatives
3. **Consider Consequences**: Both positive and negative impacts
4. **Use Template**: Follow ADR_TEMPLATE_AND_GUIDE.md structure
5. **Validate Format**: Use `./scripts/adr-helper.sh validate`

### ADR References

1. **In Commits**: Always include ADR number in subject
2. **In Code**: Add comments explaining ADR-based decisions
3. **In PRs**: Reference relevant ADRs in descriptions
4. **In Documentation**: Link to ADRs in relevant sections

### ADR Management

1. **Keep Index Updated**: Maintain ADR_INDEX.md current
2. **Use Consistent Naming**: Follow ADR-XXX-descriptive-title.md pattern
3. **Review Regularly**: Update status (proposed → accepted → deprecated)
4. **Archive Carefully**: Don't delete old ADRs, mark as superseded

## Troubleshooting

### Common Issues

#### "Script not found" Error
```bash
# Check script permissions:
ls -la scripts/adr-*.sh

# Make executable:
chmod +x scripts/adr-*.sh
```

#### "ADR not found" Error
```bash
# Check ADR directory:
ls -la dev-docs/ADR/

# Verify naming convention:
# Should be: ADR-XXX-title.md
```

#### "Validation failed" Error
```bash
# Check required sections:
grep -E "^## (Context|Decision|Consequences)" ADR-XXX.md

# Compare with template:
cat dev-docs/ADR/ADR_TEMPLATE_AND_GUIDE.md
```

### Getting Help

1. **Check Documentation**: Review ADR_TEMPLATE_AND_GUIDE.md
2. **Use Help Commands**: `./scripts/adr-*-sh help`
3. **Search ADRs**: `./scripts/adr-reference-checker.sh check-keyword <term>`
4. **Ask Team**: Post questions in project channels

---

## Resources

### Core Files
- `dev-docs/ADR/ADR_TEMPLATE_AND_GUIDE.md` - Creation template
- `dev-docs/ADR/ADR_DECISION_MATRIX.md` - Decision requirements
- `dev-docs/ADR/ADR_WORKFLOW.md` - Process documentation
- `dev-docs/ADR/ADR_INDEX.md` - Master index

### Tools
- `scripts/adr-helper.sh` - ADR management
- `scripts/adr-reference-checker.sh` - Search and reference

### Agent Guides
- `dev-docs/agent-profiles/EJECUTOR.md` - Implementation workflow
- `dev-docs/agent-profiles/VALIDADOR.md` - Review workflow

### Support
- Check existing ADRs before making new decisions
- Use the helper scripts for automation
- Follow the established templates and formats
- Keep the ADR system current and accurate