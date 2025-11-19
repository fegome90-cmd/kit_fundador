# Test Data Factory Tool

## 🎯 Purpose
Provides patterns for generating unique, realistic, and maintainable test data to ensure tests are isolated and reliable.

**Use when**:
- Writing any test that requires input data (e.g., for API requests, function arguments).
- You need to avoid test data conflicts and ensure tests are independent.

**Don't use when**:
- The function or component under test is purely deterministic and takes no input.

---

## 🔍 Patterns & Solutions

### Pattern 1: UUID for Unique IDs
Ensures that identifiers for entities (users, products, etc.) are always unique.

```javascript
// ✅ GOOD: Guaranteed unique IDs
import { v4 as uuid } from 'uuid';

const createUser = (overrides = {}) => ({
  id: uuid(),
  email: `test-${uuid()}@example.com`,
  ...overrides,
});

const user1 = createUser();
const user2 = createUser({ email: 'specific-email@example.com' });
```

### Pattern 2: Timestamp-based Uniqueness
A simple way to ensure uniqueness without external libraries, suitable for emails or names.

```javascript
// ✅ GOOD: Simple and effective uniqueness
const createProduct = (overrides = {}) => ({
  sku: `SKU-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
  name: 'A test product',
  ...overrides,
});
```

### Pattern 3: Sequence Generators
Useful for creating a series of unique items when the exact value is not as important as its uniqueness.

```javascript
// ✅ GOOD: For creating multiple, distinct items
let userSequence = 0;
const createNextUser = (overrides = {}) => ({
  email: `user${++userSequence}@example.com`,
  ...overrides,
});
```
**Note**: Use with caution, as this can introduce order dependency if not reset between tests (e.g., in a `beforeEach`).

### Pattern 4: Using a Data Generation Library (like Faker.js)
For more realistic and varied data.

```javascript
// ✅ GOOD: Creates realistic-looking data
import { faker } from '@faker-js/faker';

const createAddress = (overrides = {}) => ({
  street: faker.location.streetAddress(),
  city: faker.location.city(),
  zipCode: faker.location.zipCode(),
  ...overrides,
});
```

---

## 🚨 Quick Check

Run this mental checklist when creating test data:

**Red Flags** (fix immediately):
- [ ] Are you using hardcoded strings or numbers for IDs, emails, or names (e.g., 'test@example.com', 123)?
- [ ] Is test data shared between test files?
- [ ] Is the same object literal used in multiple tests within the same file?

**Green Flags** (good practices):
- [✓] A factory function (`create...`) is used to generate data for each test.
- [✓] Uniqueness is guaranteed via UUID, timestamp, or a sequence.
- [✓] Data generation is handled within a `beforeEach` block or at the start of each test.

---

## 🔧 Integration

### Agent Usage
When agent needs to: "Write tests for a new API endpoint".
→ Reference: `test-data-factory.md`
→ Apply: Use a factory function with UUIDs or timestamps.
→ Validate: Check that no hardcoded data is used.

### Manual Usage
Review test files for hardcoded data:
```bash
# Search for common hardcoded test strings
grep -r "test@example.com" tests/
```

---

*Version: 1.0 | Lines: ~100 | Updated: 2024-11*
