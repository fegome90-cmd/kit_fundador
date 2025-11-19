# API Contract Validator Tool

## 🎯 Purpose
Ensures API tests validate the actual behavior of the API, including status codes, response structure, and error handling, preventing contract violations.

**Use when**:
- Writing integration or end-to-end tests for an API.
- A change in the backend could break client applications.
- Reviewing tests for API endpoints.

**Don't use when**:
- Writing unit tests that do not involve API requests.

---

## 🔍 Detection Patterns

### Pattern 1: Testing Only the "Happy Path"
```javascript
// ❌ BAD: Only tests for a 200 OK response
it("creates a user", async () => {
  const response = await api.post('/users', { email: 'test@example.com' });
  expect(response.status).toBe(201);
});
// Missing tests for 400, 409, etc.
```

### Pattern 2: Not Asserting Response Structure
```javascript
// ❌ BAD: Doesn't check if the response body is correct
it("gets a user", async () => {
  const response = await api.get('/users/1');
  expect(response.status).toBe(200);
  // What if the user object is missing fields?
});
```

---

## ✅ Solutions

### Solution 1: Comprehensive Test Matrix
```javascript
// ✅ GOOD: Covers multiple status codes
describe("POST /users", () => {
  it("returns 201 on success", () => { /* ... */ });
  it("returns 400 for bad request (e.g., missing email)", () => { /* ... */ });
  it("returns 409 for duplicate email", () => { /* ... */ });
  it("returns 500 for server error", () => { /* ... */ });
});
```

### Solution 2: Schema Validation
```javascript
// ✅ GOOD: Validates the shape of the response
import { z } from 'zod';

const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  createdAt: z.string().datetime(),
});

it("returns a valid user object", async () => {
  const response = await api.get('/users/1');
  expect(response.status).toBe(200);
  expect(() => userSchema.parse(response.body)).not.toThrow();
});
```

---

## 🚨 Quick Check

Run this mental checklist on any API test file:

**Red Flags** (fix immediately):
- [ ] Are there only tests for `2xx` status codes?
- [ ] Are response bodies being asserted only for existence (`.toBeDefined()`) instead of shape?
- [ ] Are error responses not being tested at all?

**Green Flags** (good practices):
- [✓] Tests exist for common error codes like `400`, `401`, `403`, `404`, and `409`.
- [✓] A schema validation library (like Zod, Joi, or Yup) is used to validate response bodies.
- [✓] Tests cover both successful and unsuccessful API calls.

---

## 🔧 Integration

### Agent Usage
When agent sees: "API errors are not being caught" or "Client is broken after API change".
→ Reference: `contract-validator.md`
→ Apply: Use a test matrix and schema validation.
→ Validate: Check for coverage of error cases.

### Manual Usage
```bash
# Look for status code assertions in test files
grep -r "expect(response.status).toBe" tests/integration/
```

---

*Version: 1.0 | Lines: ~100 | Updated: 2024-11*
