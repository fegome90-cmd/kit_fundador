# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🏗️ Project Overview

Kit Fundador v2.0 is a **language-agnostic starter kit** designed for starting software projects with **Clean Architecture, DDD, TDD, and best practices**. It provides a professional minimal skeleton for starting projects without initial technical debt.

- **Language**: TypeScript (Node.js 20) - Default stack, can be adapted to Python via setup script
- **Architecture**: Clean Architecture with clear Domain/Application/Infrastructure separation
- **Default Bounded Context**: Identity & Access (User management)
- **Testing**: Jest with 80% coverage threshold (unit/integration/e2e structure)

## 🚀 Common Development Commands

### Setup & Installation
```bash
# Initial setup (interactive - choose stack)
./scripts/setup.sh

# Force setup without prompts (for automation)
./scripts/setup.sh --force

# Skip dependency installs (useful in CI)
SETUP_SH_SKIP_INSTALLS=true ./scripts/setup.sh
```

### Development (Docker-based)
```bash
# Start development environment
make dev
# Or: docker-compose -f docker-compose.dev.yml -p myapp up app postgres redis

# View logs
make logs

# Open shell in container
make shell

# Open PostgreSQL shell
make db-shell
```

### Testing
```bash
# Run all tests
make test
# Or: npm test

# Run specific test suites
npm run test:unit        # Unit tests only
npm run test:integration # Integration tests only
npm run test:e2e        # E2E tests only

# Run single test file
npm test -- tests/unit/domain/entities/User.test.ts

# Watch mode
npm run test:watch
# Or: make test-watch

# Coverage report (80% threshold enforced)
npm run test:coverage
# Or: make test-coverage

# Test setup script (harness)
npm run test:setup
# Or: make test:setup
```

### Build & Quality
```bash
# Build TypeScript
npm run build
# Or: tsc

# Linting
npm run lint
# Or: make lint

# Auto-fix linting issues
npm run lint:fix

# Format code
npm run format
# Or: make format

# Type checking
npm run type-check

# Validate architecture rules
make validate
```

### Database (PostgreSQL)
```bash
# Run migrations
make migrate
# Or: npm run migrate:up

# Rollback last migration
make migrate-down
# Or: npm run migrate:down

# Create new migration
npm run migrate:create migration_name

# Seed development data
make seed
# Or: npm run seed:dev
```

## 🏛️ Architecture Overview

### Clean Architecture Layers

1. **Domain Layer** (`src/domain/`)
   - **Entities**: Core business objects (`User.ts`)
   - **Value Objects**: Immutable values (`Email.ts`, `Password.ts`)
   - **Domain Events**: Events that matter to the domain (`UserCreatedEvent.ts`)
   - **Rules**: NO dependencies on outer layers, pure business logic

2. **Application Layer** (`src/application/`)
   - **Use Cases**: Application-specific business rules
   - **Ports/Interfaces**: Repository contracts, service interfaces
   - **Handlers**: Command/Query handlers
   - **DTOs**: Data transfer objects

3. **Infrastructure Layer** (`src/infrastructure/`)
   - **Repositories**: Data persistence implementations
   - **External Services**: Third-party integrations
   - **Adapters**: Database, HTTP, messaging implementations

### Key Architectural Patterns

- **Entity Pattern**: Domain entities with invariants and business methods
- **Value Object Pattern**: Immutable objects with no identity
- **Domain Events Pattern**: Events published by domain entities
- **Repository Pattern**: Abstraction over data persistence
- **Factory Pattern**: Entity creation with proper initialization

### Path Aliases (TypeScript)
```typescript
@/* → src/*
@domain/* → src/domain/*
@application/* → src/application/*
@infrastructure/* → src/infrastructure/*
```

## 🧪 Testing Strategy

### Test Organization
- **Unit Tests**: `tests/unit/` - Test individual classes/functions in isolation
- **Integration Tests**: `tests/integration/` - Test interaction between components
- **E2E Tests**: `tests/e2e/` - Test complete user workflows
- **Setup Tests**: `tests/setup/` - Test infrastructure setup scripts

### Testing Requirements
- **Coverage**: Minimum 80% threshold enforced by Jest (branches, functions, lines, statements)
- **Frameworks**: Jest (unit), plans for Playwright (e2e), Pact (contracts)
- **Mock Strategy**: Use Jest mocks for external dependencies
- **Test Organization**: Separate suites for unit/integration/e2e with path patterns

## 🔧 Important Files & Scripts

### Configuration Files
- `package.json`: Node.js dependencies and scripts (uses placeholders for entry points)
- `tsconfig.json`: TypeScript configuration with path aliases
- `jest.config.js`: Jest test configuration with coverage thresholds
- `Makefile`: Docker-based development commands

### Setup Scripts
- `scripts/setup.sh`: Interactive project initialization with stack selection
- `scripts/validate-architecture.sh`: Automated architecture rule validation
- `scripts/seed.ts`: Database seeding script (placeholder)

### Source Structure
- `src/index.ts`: Entry point placeholder (requires replacement)
- `src/domain/entities/User.ts`: Example domain entity with clean architecture patterns
- `src/domain/value-objects/`: Value objects with validation logic
- `src/domain/domain-events/`: Domain event definitions

## 📋 Development Workflow

### 1. Project Initialization
Run the interactive setup script to choose your technology stack:
```bash
./scripts/setup.sh
# Choose from: TypeScript+Node.js, Python, or JSON/Config only
```

### 2. Architecture Validation
Always validate architecture after changes:
```bash
make validate
```

### 3. Development Pattern
- **Domain First**: Start with domain entities and value objects
- **Test-Driven**: Write failing tests first (TDD methodology)
- **Clean Separation**: Respect layer boundaries (no domain → infrastructure imports)

### 4. Key Patterns
- Use factory methods (`User.create()`) for entity creation with proper initialization
- Use value objects for complex values (`Email`, `Password`) with validation logic
- Implement domain events for important business events with save → publish → clear pattern
- Follow repository pattern for data access abstraction
- Export validation constants from value objects for centralized rule management

### 5. ADR Integration
Architecture decisions are documented using Architecture Decision Records (ADRs):
```bash
# Before implementing architectural decisions:
1. Check ADR_DECISION_MATRIX.md for requirement
2. Search existing ADRs: find dev-docs/ADR -name "*.md"
3. Create ADR if required using ADR_TEMPLATE_AND_GUIDE.md
4. Reference ADR in implementation: commit messages, code comments

# ADR workflow:
- Template: dev-docs/ADR/ADR_TEMPLATE_AND_GUIDE.md
- Decision matrix: dev-docs/ADR/ADR_DECISION_MATRIX.md
- Workflow guide: dev-docs/ADR/ADR_WORKFLOW.md
- ADR index: dev-docs/ADR/ADR_INDEX.md
```

**ADR Requirements**:
- Technology stack changes: ✅ ADR required
- System architecture decisions: ✅ ADR required
- Infrastructure changes: ✅ ADR required
- Implementation details: ❌ No ADR needed

**Reference Commands**:
```bash
# List all ADRs
./scripts/adr-reference-checker.sh list

# Search ADRs by keyword
./scripts/adr-reference-checker.sh check-keyword <term>

# Get ADR suggestions
./scripts/adr-reference-checker.sh suggest "<task>"

# Create new ADR
./scripts/adr-helper.sh create

# Validate ADR format
./scripts/adr-helper.sh validate <ADR-file.md>
```

**Complete ADR Documentation**:
- **Usage Guide**: `dev-docs/ADR/ADR_USAGE_GUIDE.md` - Complete workflow guide
- **Enhanced Index**: `dev-docs/ADR/ADR_INDEX.md` - Categories, status, search
- **Template Guide**: `dev-docs/ADR/ADR_TEMPLATE_AND_GUIDE.md` - Creation templates
- **Decision Matrix**: `dev-docs/ADR/ADR_DECISION_MATRIX.md` - When to create ADRs
- **Workflow Guide**: `dev-docs/ADR/ADR_WORKFLOW.md` - Complete lifecycle

## ⚠️ Critical Notes

### Placeholders Requiring Replacement
- `src/index.ts`: Replace with actual application entry point
- `scripts/seed.ts`: Replace with real database seeding logic
- `package.json` entry points: Update placeholders:
  - `<project-entrypoint>` → `src/index.ts` (or your entry point)
  - `<build-output>` → `dist/index.js` (or your build output)
  - `<seed-script>` → `scripts/seed.ts` (or your seed script)
- Domain events dispatcher: Replace in-memory implementation with real infrastructure

### Database Setup
The kit uses PostgreSQL by default but doesn't provision actual database services. Follow `dev-docs/infrastructure/database-blueprint.md` to set up your database strategy.

### Architecture Enforcement
The architecture validation script (`scripts/validate-architecture.sh`) enforces:
- Domain layer must not import from infrastructure (checked via static analysis)
- Required documentation files exist in dev-docs/
- Clean layer separation with proper directory structure
- Language-agnostic validation for TypeScript, Go, or Python

### Testing in CI
Use `SETUP_SH_SKIP_INSTALLS=true` in CI environments to skip dependency installation during setup testing.

## 📚 Documentation Structure

All extended documentation lives in `dev-docs/`:
- `dev-docs/context.md`: Project context and technical stack
- `dev-docs/plan.md`: Development roadmap and milestones
- `dev-docs/domain/ubiquitous-language.md`: Domain glossary and bounded contexts
- `dev-docs/user-dd/consumer-checklist.md`: Post-clone adoption checklist
- Various blueprints for database, use cases, and setup remediation

## 🎯 Current State

- ✅ **Foundation**: Complete folder structure, tooling, CI/CD
- ✅ **Domain Layer**: User entity with Email/Password value objects and domain events
- ✅ **Setup Script**: Interactive stack selection with validation harness
- ✅ **Architecture Validation**: Automated Clean Architecture enforcement
- 🔄 **Application Layer**: Ready for use case implementation (stubs in place)
- ⏳ **Infrastructure**: Database setup required by consumer
- ⏳ **Dev-Docs**: Source of truth structure established

The project provides a professional foundation but requires consumers to replace placeholders and implement their specific business logic.