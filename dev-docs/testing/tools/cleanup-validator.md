# Cleanup Validator Tool

## 🎯 Purpose
Ensures resources (DB, servers, files) are properly cleaned up after tests to prevent memory leaks and state pollution.

**Use when**:
- Tests fail due to resource conflicts (e.g., port in use).
- Test suite slows down over time.
- Reviewing integration tests that interact with external services.

**Don't use when**:
- Writing simple, stateless unit tests.

---

## 🔍 Detection Patterns

### Pattern 1: Missing afterEach
```javascript
// ❌ BAD: Resource created but never destroyed
describe("File System Tests", () => {
  let tempDir;

  beforeEach(() => {
    tempDir = fs.mkdtempSync('/tmp/test-');
  });

  it("writes a file", () => {
    fs.writeFileSync(path.join(tempDir, 'file.txt'), 'hello');
  });

  // Missing afterEach to remove tempDir
});
```

### Pattern 2: Unclosed Connections
```javascript
// ❌ BAD: Database connection is not closed
it("connects to the database", async () => {
  const connection = await db.connect();
  // ... test logic ...
  // Connection is left open
});
```

---

## ✅ Solutions

### Solution 1: beforeEach/afterEach Pairing
```javascript
// ✅ GOOD: Cleanup logic mirrors setup logic
describe("API Server Tests", () => {
  let server;

  beforeEach(async () => {
    server = await startServer();
  });

  afterEach(async () => {
    await server.close(); // Server is always closed
  });

  it("responds to /health", () => api.get('/health'));
});
```

### Solution 2: try/finally for Guaranteed Cleanup
```javascript
// ✅ GOOD: Ensures cleanup even if the test fails
it("handles resources safely", async () => {
  let resource;
  try {
    resource = await getResource();
    // ... test logic that might throw an error ...
  } finally {
    await resource.cleanup();
  }
});
```

---

## 🚨 Quick Check

Run this mental checklist on any integration test file:

**Red Flags** (fix immediately):
- [ ] Is there a `beforeEach` without a corresponding `afterEach`?
- [ ] Are there calls to `connect`, `createServer`, or `mkdtemp` without a matching `close`, `stop`, or `rm`?
- [ ] Do tests rely on a globally defined resource that is not cleaned up?

**Green Flags** (good practices):
- [✓] Every resource allocation in `beforeEach` has a corresponding deallocation in `afterEach`.
- [✓] `try/finally` blocks are used for resources created and destroyed within a single test.
- [✓] Cleanup functions are robust and don't throw errors if the resource doesn't exist.

---

## 🔧 Integration

### Agent Usage
When agent sees: "Tests failing with memory leaks" or "Port already in use".
→ Reference: `cleanup-validator.md`
→ Apply: Solutions section patterns.
→ Validate: Quick Check section.

### Manual Usage
```bash
# Review test file for cleanup logic
grep -n "beforeEach" tests/integration/api.test.ts
grep -n "afterEach" tests/integration/api.test.ts
```

---

*Version: 1.0 | Lines: ~100 | Updated: 2024-11*
