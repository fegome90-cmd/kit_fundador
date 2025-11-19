# ADR-003: Test Isolation Strategy

## Status
**Status**: Required
**Priority**: Critical
**Date**: 2025-11-18
**Author**: VALIDADOR

---

## Context

Integration tests are failing due to shared state between test executions, causing HTTP 409 conflicts and making tests unreliable and dependent on execution order.

---

## Problem Statement

### The Problem
- Tests share `InMemoryUserAccountRepository` instance globally
- User data persists across test runs
- First test creates user, second test gets HTTP 409
- Test results become non-deterministic and unreliable
- CI/CD pipeline stability compromised

### Root Causes Identified
1. **Missing beforeEach/afterEach hooks** for repository state cleanup
2. **Shared repository instance** across all tests
3. **Static test data reuse** causing conflicts
4. **No test isolation strategy** implemented

### Impact Analysis
- **Testing Quality**: Tests become unreliable and unpredictable
- **Development Workflow**: Debugging becomes difficult
- **CI/CD Pipeline**: Flaky test results and failed builds
- **Team Productivity**: Time wasted on investigating non-existent bugs

---

## Decision

**Mandate**: All integration and contract tests must implement comprehensive test isolation using beforeEach/afterEach hooks with repository state cleanup.

### Chosen Approach
Implement systematic cleanup hooks that:
1. Reset repository state before each test
2. Ensure test data independence
3. Make test execution order irrelevant
4. Provide reliable and deterministic results

---

## Implementation

### Required Code Pattern
```typescript
describe('User Registration API Contract', () => {
  let repository: InMemoryUserAccountRepository;

  beforeEach(async () => {
    repository.clear(); // ← ESTADO LIMPIO ANTES DE CADA TEST
  });

  afterEach(async () => {
    // Opcional: limpieza adicional si es necesaria
    // repository.clear();
  });

  it('should register unique user', async () => {
    const uniqueUser = {
      email: `test${Date.now()}@example.com`, // ← DATOS ÚNICOS
      name: "TestUser",
      password: "SecurePass123!",
      role: "user"
    };

    // Test implementation - siempre empieza con estado limpio
    const response = await request(baseURL)
      .post('/api/users/register')
      .send(uniqueUser);

    expect(response.status).toBe(201); // ← SIEMPRE 201
  });
});
```

### Implementation Guidelines

#### 1. Repository State Management
```typescript
// ✅ CORRECTO: Cleanup explícito
beforeEach(() => {
  repository.clear();
});

// ❌ INCORRECT: Sin cleanup
describe('Tests', () => {
  // Tests comparten estado
});
```

#### 2. Test Data Independence
```typescript
// ✅ CORRECTO: Datos únicos
const uniqueUser = {
  email: `user${Math.random().toString(36)}@example.com`,
  // Otras propiedades
};

// ❌ INCORRECT: Datos compartidos
const sharedUser = {
  email: "test@example.com", // ← MISMO EMAIL EN MÚLTIPLES TESTS
};
```

#### 3. Hook Placement
```typescript
// ✅ CORRECTO: Hooks al nivel de describe
describe('Test Suite', () => {
  beforeEach(() => repository.clear());
  // Tests aquí
});

// ❌ INCORRECT: Hooks globales o mal ubicados
beforeEach(() => repository.clear()); // ← Fuera de describe
describe('Test Suite', () => {
  // Tests aquí
});
```

---

## Consequences

### Positive Impacts
- **Test Reliability**: Tests become independent and deterministic
- **HTTP 409 Eliminated**: No more conflicts from shared state
- **CI/CD Stability**: Consistent test results in pipeline
- **Development Speed**: Faster debugging with predictable test behavior
- **Team Confidence**: Tests become trustworthy indicators

### Negative Impacts
- **Implementation Effort**: Minimal changes required
- **Learning Curve**: Team needs to understand test isolation patterns
- **Code Overhead**: Slightly more code per test file

---

## Follow-up Actions

### Immediate Actions Required
1. **Add beforeEach hooks** to all integration test files
2. **Implement repository.clear()** calls in cleanup
3. **Update test data** to use unique identifiers
4. **Run test suite** to verify all tests pass consistently

### Implementation Checklist
- [ ] Add beforeEach(async () => repository.clear()) to test files
- [ ] Verify no HTTP 409 conflicts between tests
- [ ] Confirm tests pass in any execution order
- [ ] Update test data with unique identifiers
- [ ] Run full test suite to validate fixes

### Validation Criteria
- **All tests pass**: 10/10 consistently
- **No HTTP 409 errors**: Conflicts eliminated
- **Test independence**: Results don't depend on execution order
- **CI/CD stability**: Tests pass reliably in pipeline

---

## Anti-patterns to Avoid

### ❌ Shared Repository Pattern
```typescript
// ANTI-PATTERN: Evitar esto
const repository = new InMemoryUserAccountRepository(); // ← Global instance

describe('Tests', () => {
  // Tests comparten el mismo repository
});
```

### ❌ Static Test Data Pattern
```typescript
// ANTI-PATTERN: Evitar esto
const user = { email: "test@example.com" }; // ← Misma data

describe('Tests', () => {
  // Tests reusan el mismo email → HTTP 409
});
```

### ❌ Missing Cleanup Pattern
```typescript
// ANTI-PATTERN: Evitar esto
describe('Tests', () => {
  // Sin hooks de limpieza
  // Estado persiste entre tests
});
```

---

## Success Metrics

### Quantitative Measures
- **Test Success Rate**: 100% (0 failures from HTTP 409)
- **Test Execution Time**: < 5 seconds per test
- **HTTP 409 Errors**: 0 across full test suite
- **CI/CD Pass Rate**: 100% consistency

### Qualitative Measures
- **Developer Confidence**: High - tests are reliable indicators
- **Debuggability**: Improved - issues are isolated to single tests
- **Team Velocity**: Increased - less time investigating false failures
- **Code Quality**: Enhanced - better test practices implemented

---

## Status

**Current State**: Implementation Required
**Target Date**: Immediate implementation
**Success Definition**: All integration tests pass 10/10 without HTTP 409 conflicts

---

## Related Documents

- [ADR-001](ADR-001-adr-integration-system.md) - ADR Integration System
- [ADR-002](ADR-002-bcrypt-password-hashing.md) - Password Hashing Strategy
- [dev-docs/testing/contract-testing-guidelines.md](../testing/contract-testing-guidelines.md) - Contract Testing Standards

---

*This ADR addresses the critical testing isolation issues identified during Phase 2 contract test implementation and provides systematic solutions for preventing HTTP 409 conflicts through proper test isolation patterns.*