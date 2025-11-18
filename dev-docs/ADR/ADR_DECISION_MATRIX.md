# ADR Decision Matrix

## Purpose

This matrix helps determine when an Architecture Decision Record (ADR) is required for a decision in this project.

## Decision Categories

### 🏗️ **ARCHITECTURAL - ADR REQUIRED**

**Always create ADR for these decisions:**

| Category | Examples | ADR Required |
|----------|------------|---------------|
| **Technology Stack** | Framework choice, DB selection, language selection | ✅ YES |
| **System Architecture** | Microservices vs monolith, CQRS, event-driven | ✅ YES |
| **Infrastructure** | Deployment strategy, monitoring setup, CI/CD pipeline | ✅ YES |
| **Security** | Authentication approach, authorization model, encryption strategy | ✅ YES |
| **Data Architecture** | Database schema, data modeling, migration strategy | ✅ YES |
| **Integration Patterns** | API design, service communication, message protocols | ✅ YES |
| **Performance Strategy** | Caching approach, scaling strategy, load balancing | ✅ YES |
| **Major Refactoring** | Domain restructure, architectural pattern change | ✅ YES |

### 🔧 **DESIGN - ADR MAYBE**

**Consider ADR for significant design decisions:**

| Category | Examples | ADR Required |
|----------|------------|---------------|
| **Domain Model** | New bounded context, aggregate design | 🤔 MAYBE |
| **API Design** | REST vs GraphQL, API versioning | 🤔 MAYBE |
| **Component Design** | New component library, design system | 🤔 MAYBE |
| **Test Strategy** | Major testing framework change | 🤔 MAYBE |

### ⚙️ **IMPLEMENTATION - ADR RARELY**

**Only ADR for implementation decisions with architectural impact:**

| Category | Examples | ADR Required |
|----------|------------|---------------|
| **Algorithm Choice** | Sorting algorithm, search implementation | ❌ RARELY |
| **Code Organization** | File structure, naming patterns | ❌ RARELY |
| **Library Selection** | Minor utility library, logging framework | ❌ RARELY |
| **Bug Fix Approach** | How to fix a specific bug | ❌ NO |

### 🚫 **NEVER ADR**

**Never create ADR for these decisions:**

| Category | Examples | ADR Required |
|----------|------------|---------------|
| **Variable Names** | `user` vs `userData`, method names | ❌ NEVER |
| **Code Style** | Formatting, linting rules | ❌ NEVER |
| **Minor Refactors** | Extract method, rename variable | ❌ NEVER |
| **Test Cases** | Which tests to write | ❌ NEVER |
| **Commit Messages** | Message format, branch naming | ❌ NEVER |
| **Configuration** | Tool settings, environment variables | ❌ NEVER |

---

## Quick Decision Flow

### Step 1: Identify Decision Type

```bash
# Ask yourself:
1. Does this affect the overall system architecture? → YES → Create ADR
2. Does this change how major components interact? → YES → Create ADR
3. Does this introduce significant new technology? → YES → Create ADR
4. Is this about code organization or style? → NO → No ADR
5. Is this a minor implementation detail? → NO → No ADR
```

### Step 2: Impact Assessment

```bash
# Score 1-5 for each criteria:
# Technology impact (1=local, 5=system-wide)
# Future implications (1=short-term, 5=long-term)
# Reversibility (1=easy, 5=very hard)
# Team impact (1=individual, 5=whole-team)

# Total score ≥ 10? → Create ADR
# Total score < 10? → Probably no ADR needed
```

### Step 3: ADR Creation Checklist

**If ADR is required:**

- [ ] Use official ADR template from `ADR_TEMPLATE_AND_GUIDE.md`
- [ ] Sequential ID (ADR-001, ADR-002, etc.)
- [ ] Current date (YYYY-MM-DD)
- [ ] All sections completed: Context, Decision, Consequences
- [ ] Clear alternatives considered
- [ ] Specific action items defined
- [ ] Review with team before finalizing

---

## Examples

### ✅ **Example: ADR REQUIRED**

**Decision**: "Switch from polling to WebSockets for real-time notifications"

- **Technology impact**: 4/5 (affects multiple components)
- **Future implications**: 4/5 (long-term architectural pattern)
- **Reversibility**: 3/5 (hard to revert)
- **Team impact**: 4/5 (requires team coordination)
- **Total**: 15/20 → **ADR REQUIRED**

### 🤔 **Example: ADR MAYBE**

**Decision**: "Use repository pattern for data access"

- **Technology impact**: 2/5 (implementation pattern)
- **Future implications**: 3/5 (affects future development)
- **Reversibility**: 2/5 (reversible with effort)
- **Team impact**: 2/5 (local pattern)
- **Total**: 9/20 → **ADR MAYBE** (depends on complexity)

### ❌ **Example: NO ADR**

**Decision**: "Use `map()` instead of `for()` loop"

- **Technology impact**: 1/5 (local implementation)
- **Future implications**: 1/5 (no architectural impact)
- **Reversibility**: 1/5 (trivial to change)
- **Team impact**: 1/5 (individual choice)
- **Total**: 4/20 → **NO ADR**

---

## Integration with Development Workflow

### For EJECUTOR:

```markdown
## Pre-Implementation Checklist
- [ ] Check existing ADRs for relevant decisions
- [ ] If decision requires ADR, create/update ADR first
- [ ] Reference relevant ADRs in commit messages
```

### For VALIDADOR:

```markdown
## Review Checklist
- [ ] Were required ADRs created for architectural decisions?
- [ ] Are ADRs properly referenced in documentation?
- [ ] Is decision matrix being followed consistently?
```

---

## ADR File Organization

```
dev-docs/ADR/
├── ADR_TEMPLATE_AND_GUIDE.md      # This file
├── ADR_DECISION_MATRIX.md         # This file
├── ADR-001-title.md             # First ADR
├── ADR-002-title.md             # Second ADR
└── ADR-INDEX.md                 # List of all ADRs with categories
```

### ADR Naming Convention

```
ADR-[3-digit-number]-[short-kebab-title].md

Examples:
├── ADR-001-adopt-typescript.md
├── ADR-002-clean-architecture-ddd.md
├── ADR-003-postgresql-primary-db.md
└── ADR-004-websockets-notifications.md
```

---

## Reference Implementation

When you need to make an architectural decision:

1. **Consult this matrix** to determine if ADR is needed
2. **Use the ADR template** from `ADR_TEMPLATE_AND_GUIDE.md`
3. **Save with sequential numbering** in `dev-docs/ADR/`
4. **Update ADR-INDEX.md** with new ADR
5. **Reference ADR** in relevant code comments and documentation

This ensures architectural decisions are properly documented, searchable, and available for future reference by both humans and AI agents.