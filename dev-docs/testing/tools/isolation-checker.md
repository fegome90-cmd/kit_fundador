# Isolation Checker Tool

## 🎯 Purpose
Detects shared mutable state between tests that causes HTTP 409 conflicts and flaky tests.

**Use when**: 
- Tests fail intermittently
- Getting HTTP 409 (Conflict) errors
- Second test run fails but first passes
- Reviewing new test files in PR

**Don't use when**: 
- Tests pass consistently
- Doing initial test setup (use after tests written)

---

## 🔍 Detection Patterns

### Pattern 1: Shared Test Objects
```javascript
// ❌ BAD: Will cause conflicts
const testUser = { email: "test@example.com" };

describe("User API", () => {
  it("creates user", () => api.post('/users', testUser));  // ✅ First run
  it("gets user", () => api.get('/users/1'));              // 💥 Second run: 409
});
```

### Pattern 2: Static Arrays
```javascript
// ❌ BAD: Shared mutable array
const users = [{ id: 1, name: "Test" }];

it("adds user", () => users.push({ id: 2 }));    // Modifies shared state
it("counts users", () => expect(users).toHaveLength(1)); // 💥 Flaky
```

### Pattern 3: Module-Level Variables
```javascript
// ❌ BAD: Module-level state
let counter = 0;

it("increments", () => counter++);
it("checks count", () => expect(counter).toBe(1)); // 💥 Depends on order
```

---

## ✅ Solutions

### Solution 1: Factory Functions
```javascript
// ✅ GOOD: Unique data per test
const createUser = () => ({
  email: `test-${Date.now()}-${Math.random()}@example.com`,
  password: "password123"
});

it("creates user", () => api.post('/users', createUser())); // Unique
it("creates another", () => api.post('/users', createUser())); // Also unique
```

### Solution 2: beforeEach Setup
```javascript
// ✅ GOOD: Fresh state per test
describe("User API", () => {
  let testUser;

  beforeEach(() => {
    testUser = createUser(); // Fresh instance every test
  });

  it("creates user", () => api.post('/users', testUser));
  it("validates user", () => expect(testUser.email).toBeDefined());
});
```

### Solution 3: UUID Generation
```javascript
// ✅ GOOD: Guaranteed unique IDs
import { v4 as uuid } from 'uuid';

const createUser = () => ({
  id: uuid(),
  email: `test-${uuid()}@example.com`
});
```

---

## 🚨 Quick Check

Run this mental checklist on any test file:

**Red Flags** (fix immediately):
- [ ] Any `const testData = {}` outside describe blocks?
- [ ] Any arrays/objects reused in multiple tests?
- [ ] Any `let` variables modified in tests?
- [ ] Any hardcoded emails/IDs used in multiple tests?

**Green Flags** (good practices):
- [✓] Factory functions for test data?
- [✓] `beforeEach()` creates fresh state?
- [✓] UUID or timestamp in test data?
- [✓] Each test can run independently?

---

## 🔧 Integration

### Agent Usage
When agent sees: "Tests failing with HTTP 409" or "Flaky tests"
→ Reference: `isolation-checker.md`
→ Apply: Solutions section patterns
→ Validate: Quick Check section

### Manual Usage
```bash
# Review test file
grep -n "const test" tests/user.test.ts  # Find potential shared state
grep -n "beforeEach\|afterEach" tests/user.test.ts  # Check setup/cleanup
```

---

*Version: 1.0 | Lines: ~100 | Updated: 2024-11*
