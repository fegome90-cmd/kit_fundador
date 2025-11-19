# ADR-004: Integration Test Structure Standards

## Status
**Status**: Required
**Priority**: Critical
**Date**: 2025-11-18
**Author**: VALIDADOR

---

## Context

Integration tests have incorrect import paths causing TypeScript compilation errors, preventing test execution and blocking development workflow.

---

## Problem Statement

### The Issue
- Integration test files contain incorrect relative import paths
- TypeScript cannot resolve `../../../src/infrastructure/_stubs/InMemoryUserAccountRepository`
- Module resolution failures prevent test compilation
- Tests cannot be executed to validate functionality

### Root Causes Identified
1. **Incorrect Relative Paths**: Import calculations are wrong
2. **Missing Module Declarations**: TypeScript cannot find source modules
3. **Build Process Gaps**: Tests not included in compilation scope
4. **Path Resolution Configuration**: TypeScript configuration misalignment

### Impact Analysis
- **Testing Quality**: Zero test coverage due to compilation failures
- **Development Workflow**: Complete blockage of integration testing
- **CI/CD Pipeline**: Tests cannot run in automation
- **Team Productivity**: Development stalled on syntax issues

---

## Decision

**Mandate**: Standardize integration test import paths to ensure TypeScript compilation and test execution.

### Chosen Approach
Implement consistent path resolution pattern with correct module imports and TypeScript configuration.

---

## Implementation

### Required Path Pattern
```typescript
// ✅ CORRECTO: Paths absolutos o relativos correctos
import { InMemoryUserAccountRepository } from '../../../../src/infrastructure/_stubs/InMemoryUserAccountRepository';

// ✅ CORRECTO: Path verification con find
import { HttpServer } from '../../../../src/infrastructure/http/server';

// ❌ INCORRECTO: Paths mal calculados
import { Repository } from '../../../src/infrastructure/_stubs/Repository';
```

### TypeScript Configuration Update
```json
// tsconfig.json - Paths para resolución de módulos
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@infrastructure/*": ["src/infrastructure/*"],
      "@tests/*": ["tests/*"]
    }
  }
}
```

### Implementation Guidelines

#### 1. Path Resolution Strategy
```typescript
// ✅ ESTRATEGIA A: Usar paths absolutos con baseUrl
import { InMemoryUserAccountRepository } from '@/infrastructure/_stubs/InMemoryUserAccountRepository';

// ✅ ESTRATEGIA B: Paths relativos correctos
import { InMemoryUserAccountRepository } from '../../../../src/infrastructure/_stubs/InMemoryUserAccountRepository';

// ❌ EVITAR: Paths relativos incorrectos
import { Repository } from '../../../src/infrastructure/_stubs/Repository';
```

#### 2. Test File Structure
```
tests/
├── integration/
│   ├── api/
│   │   └── users/
│   │       ├── user-registration.contract.test.ts
│   │       └── other-tests.test.ts
│   └── application/
│       └── use-case/
└── unit/
    ├── domain/
    ├── infrastructure/
    └── application/
```

#### 3. Module Declaration
```typescript
// src/infrastructure/_stubs/index.ts - Barrel exports
export * from './InMemoryUserAccountRepository';
export * from './UserRepository';
export * from './other-stubs';
```

---

## Consequences

### Positive Impacts
- **Test Compilation**: TypeScript errors eliminated
- **Integration Tests**: Become executable and meaningful
- **Development Workflow**: Unblocked and functional
- **CI/CD Pipeline**: Tests run successfully in automation
- **Code Quality**: Consistent import patterns across project

### Negative Impacts
- **Implementation Effort**: Requires path recalculations
- **Code Modifications**: All test files need updates
- **Learning Curve**: Team must understand new patterns

---

## Implementation Checklist

### Required Changes
- [ ] Update all integration test imports with correct paths
- [ ] Add module declarations for stub exports
- [ ] Configure TypeScript paths resolution
- [ ] Verify test compilation succeeds
- [ ] Run integration test suite to validate
- [ ] Update CI/CD configuration if needed

### Validation Criteria
- **All tests compile**: Zero TypeScript errors
- **Integration tests run**: All tests execute successfully
- **Module resolution**: All imports resolve correctly
- **No path errors**: Zero relative path issues
- **CI/CD execution**: Tests pass in pipeline

---

## Anti-patterns to Avoid

### ❌ Incorrect Path Patterns
```typescript
// ANTI-PATTERN: Paths mal calculados
import { Module } from '../../../src/path/to/module';

// ANTI-PATTERN: Imports no resueltos
import { Module } from './../../src/module';

// ANTI-PATTERN: Paths relativos ambiguos
import { Module } from '../src/module';
```

### ✅ Correct Path Patterns
```typescript
// CORRECTO: Paths absolutos configurados
import { Module } from '@/path/to/module';

// CORRECTO: Paths relativos precisos
import { Module } from '../../../../src/infrastructure/path/to/module';

// CORRECTO: Index barrel exports
import { Module } from '@/infrastructure/_stubs';
```

---

## Success Metrics

### Quantitative Measures
- **TypeScript Compilation**: 100% success rate
- **Integration Test Execution**: 100% pass rate
- **Import Resolution**: 100% success rate
- **CI/CD Test Success**: 100% consistency

### Qualitative Measures
- **Development Velocity**: Improved - no compilation blocks
- **Test Quality**: Enhanced - meaningful integration tests
- **Code Maintainability**: Better - consistent patterns
- **Team Productivity**: Increased - faster development cycles

---

## Status

**Current State**: Implementation Required
**Target Date**: Immediate implementation
**Success Definition**: All integration tests compile and execute successfully

---

## Related Documents

- [ADR-003](ADR-003-test-isolation-strategy.md) - Test Isolation Strategy
- [dev-docs/testing/contract-testing-guidelines.md](../testing/contract-testing-guidelines.md) - Contract Testing Standards
- [dev-docs/README_FULL.md](../README_FULL.md) - Complete Project Documentation

---

*This ADR addresses the critical path resolution issues preventing integration test compilation and execution, providing systematic solutions for establishing consistent and reliable test structure patterns.*