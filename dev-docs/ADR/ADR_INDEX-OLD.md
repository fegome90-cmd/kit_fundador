# Architecture Decision Records Index

## Index

*Note: ADRs are being created as part of Day 3 integration testing.*

---

## By Number

- [ADR-001](ADR-001-adr-integration-system.md) - ADR Integration System

---

## By Category

### 🏗️ Architecture
*None yet*

### 🔧 Technology Stack
*None yet*

### 🗄️ Infrastructure
*None yet*

### 🛡️ Security
*None yet*

---

## By Status

### ✅ Accepted
*None yet*

### 📋 Proposed
*None yet*

### ⚠️ Deprecated
*None yet*

### 🔄 Superseded
*None yet*

---

## Quick Reference

### How to Create ADR

1. **Check if ADR required**: Consult `ADR_DECISION_MATRIX.md`
2. **Use template**: Follow `ADR_TEMPLATE_AND_GUIDE.md`
3. **Sequential numbering**: Next available number
4. **Save here**: `dev-docs/ADR/ADR-XXX-title.md`
5. **Update index**: Add new ADR to this file

### ADR Naming Convention

```bash
ADR-[3-digit-number]-[short-kebab-title].md

Examples:
├── ADR-001-adopt-typescript.md
├── ADR-002-clean-architecture-ddd.md
└── ADR-003-postgresql-primary-db.md
```

### Template Location

- **Main Template**: `ADR_TEMPLATE_AND_GUIDE.md`
- **Decision Matrix**: `ADR_DECISION_MATRIX.md`
- **Workflow Guide**: `ADR_WORKFLOW.md`

---

## Search ADRs

```bash
# List all ADRs
find . -name "ADR-*.md" | sort

# Search by keyword
grep -r "keyword" .

# Recent ADRs
ls -lt ADR-*.md
```

*Last updated: 2025-11-17*