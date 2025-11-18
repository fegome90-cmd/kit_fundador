# ADR Workflow Guide

## Overview

This workflow defines how Architecture Decision Records (ADRs) integrate into the development lifecycle of Kit Fundador v2.0.

## 🔄 Complete ADR Lifecycle

### Phase 1: Decision Identification

```bash
# Team member identifies need for architectural decision
# Triggers:
# - New feature with architectural implications
# - Technology stack change
# - Major refactoring requirement
# - Performance/scaling issue
```

### Phase 2: ADR Requirement Check

```bash
# Consult ADR_DECISION_MATRIX.md
# Question: Does this decision require an ADR?
# - If YES: Proceed to ADR creation
# - If MAYBE: Discuss with team first
# - If NO: Implement directly
```

### Phase 3: ADR Creation

```bash
# Use template from ADR_TEMPLATE_AND_GUIDE.md
# Steps:
1. Copy template to new ADR-XXX-name.md file
2. Complete all sections (Context, Decision, Consequences)
3. Get team review/sign-off if needed
4. Save in dev-docs/ADR/ directory
```

### Phase 4: Implementation with ADR Reference

```bash
# Implementation references the ADR:
# - In commit messages: "ADR-001: Implement WebSocket notifications"
# - In code comments: "// See ADR-001 for details"
# - In PR descriptions: "Implements ADR-001"
```

### Phase 5: ADR Evolution

```bash
# ADR status updates:
# proposed → accepted (after team approval)
# accepted → deprecated (when replaced)
# accepted → superseded (when updated by new ADR)
```

---

## 🎯 Integration Points

### 1. Development Workflow Integration

#### Before Any Implementation Task

```markdown
## Pre-Implementation Checklist
- [ ] Reviewed ADR_DECISION_MATRIX.md for ADR requirement
- [ ] Checked existing ADRs for relevant decisions
- [ ] If ADR required: Created/updated ADR before coding
- [ ] Referenced relevant ADRs in task description
```

#### During Implementation

```markdown
## Implementation Guidelines
- [ ] Reference applicable ADRs in code comments
- [ ] Note when implementation deviates from ADR (with reason)
- [ ] Update ADR if significant new insights emerge
```

#### After Implementation

```markdown
## Post-Implementation Checklist
- [ ] Implementation follows all ADR decisions
- [ ] Updated ADR status to "accepted" if applicable
- [ ] Created new ADR if approach changed significantly
- [ ] ADR linked from relevant documentation
```

### 2. Documentation Integration

#### CLAUDE.md Updates Required

```markdown
### ADR Integration Section
Add to CLAUDE.md under "Development Workflow":

#### ADR Workflow
```bash
# Before implementing architectural decisions:
1. Check ADR_DECISION_MATRIX.md for requirement
2. Search existing ADRs: find dev-docs/ADR -name "*.md"
3. Create ADR if required using ADR_TEMPLATE_AND_GUIDE.md
4. Reference ADR in implementation: commit messages, code comments
```

#### ADR Commands
```bash
# List all ADRs
find dev-docs/ADR -name "ADR-*.md" | sort

# Search ADRs by keyword
grep -r "keyword" dev-docs/ADR/

# Validate ADR format
# (Manual validation against template)
```

### 3. Agent Profile Integration

#### EJECUTOR.md Updates Required

Add to Pre-Implementation Checklist:

```markdown
- [ ] Checked existing ADRs for relevant decisions
- [ ] Created ADR if decision requires it
- [ ] Referenced ADRs in commit messages
- [ ] Noted any deviations from ADRs with justification
```

#### VALIDADOR.md Updates Required

Add to Review Checklist:

```markdown
- [ ] Required ADRs exist for architectural decisions
- [ ] ADRs follow proper format and structure
- [ ] ADRs are properly referenced in code and documentation
- [ ] ADR-DECISION_MATRIX.md was consulted appropriately
```

---

## 📁 ADR File Organization

### Directory Structure

```
dev-docs/ADR/
├── ADR_TEMPLATE_AND_GUIDE.md     # Template and creation guide
├── ADR_DECISION_MATRIX.md         # When to create ADR
├── ADR_WORKFLOW.md              # This workflow guide
├── ADR_INDEX.md                 # Master list of all ADRs
├── ADR-001-title.md             # Sequential ADR files
├── ADR-002-title.md
└── ADR-003-title.md
```

### ADR Index Format (ADR-INDEX.md)

```markdown
# Architecture Decision Records

## By Number

- [ADR-001](ADR-001-title.md) - Title
- [ADR-002](ADR-002-title.md) - Title

## By Category

### Technology Stack
- [ADR-001](ADR-001-title.md) - Technology choice

### Architecture
- [ADR-002](ADR-002-title.md) - System design

### Infrastructure
- [ADR-003](ADR-003-title.md) - Deployment strategy

## By Status

### Accepted
- ADR-001, ADR-002

### Proposed
- ADR-004

### Superseded
- ADR-003 (by ADR-005)
```

---

## 🔍 ADR Search and Discovery

### Manual Search Methods

```bash
# By number
ls dev-docs/ADR/ADR-001*

# By technology
grep -r "PostgreSQL" dev-docs/ADR/

# By category
grep -r "Architecture" dev-docs/ADR/

# Recent ADRs
ls -lt dev-docs/ADR/ADR-*.md
```

### Integration with Development Tools

```bash
# Git hooks to check ADR requirement
# Pre-commit hook: Check if architectural changes have ADRs

# IDE integration
# VS Code: Add ADR directory to workspace
# Search: dev-docs/ADR/ directory for context
```

---

## 🚀 Best Practices

### ADR Creation

1. **Use the Template**: Never write ADRs from scratch
2. **Sequential Numbering**: Always use next sequential number
3. **Clear Decision**: Avoid ambiguous language
4. **Consider Alternatives**: Show analysis was thorough
5. **Document Consequences**: Both positive and negative

### ADR Maintenance

1. **Never Edit Accepted ADRs**: Create new ADR to supersede
2. **Status Updates**: Change status appropriately as project evolves
3. **Cross-References**: Link related ADRs together
4. **Regular Review**: Ensure ADRs remain relevant

### ADR Integration

1. **Early Reference**: Reference ADRs before implementation starts
2. **Implementation Alignment**: Ensure code follows ADR decisions
3. **Documentation Updates**: Update all relevant documentation
4. **Team Communication**: Ensure all team members know about ADRs

---

## 🎭 Example Workflow in Action

### Scenario: Choosing Database Technology

```bash
# 1. Decision Point
Team needs to choose database for new microservice

# 2. Matrix Check
Consult ADR_DECISION_MATRIX.md:
- Technology Stack impact: 5/5 → ADR REQUIRED
- Future implications: 4/5 → ADR REQUIRED
- Total: High → CREATE ADR

# 3. Existing ADR Search
find dev-docs/ADR -name "*database*"
# No existing ADRs found for this topic

# 4. ADR Creation
Copy ADR_TEMPLATE_AND_GUIDE.md → ADR-007-database-selection.md
Complete with context, decision, consequences
Get team review and approval

# 5. Implementation
Commit with reference: "feat: Implement PostgreSQL persistence (ADR-007)"
Add code comments: "// Database choice per ADR-007"

# 6. Documentation
Update ADR-INDEX.md with new ADR
Reference ADR in technical documentation
```

This workflow ensures all architectural decisions are properly documented, reviewed, and integrated into the development process while maintaining the agility of the team.