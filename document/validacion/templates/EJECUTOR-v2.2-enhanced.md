# 🎯 EJECUTOR TEMPLATE v2.2 - Enhanced with CodeRabbitAI Prevention

## 🚨 **PRE-COMMIT VALIDATION REQUIREMENTS**

### **Phase 1: Type Safety & Async (25% weight)**
- [ ] **Verify await only used on Promise<void>/Promise<T> methods**
  ```typescript
  // ✅ CORRECT - Async method
  await server.stop(); // Returns Promise<void>

  // ✅ CORRECT - Sync method
  server.start(); // Returns void, no await

  // ❌ WRONG - AVOID
  await server.start(); // Returns void, shouldn't await
  ```

- [ ] **Method return type verification**
  - `server.start()` returns `void` (synchronous)
  - `server.stop()` returns `Promise<void>` (asynchronous)
  - No async/await mismatches

- [ ] **TypeScript strict mode compilation**
  ```bash
  npx tsc --noEmit --strict
  # Must pass with zero errors
  ```

### **Phase 2: Dependency Management (20% weight)**
- [ ] **@types/ packages compatibility**
  ```json
  // ✅ CORRECT - Compatible versions
  "@types/bcrypt": "^6.0.0",     // Same major as bcrypt
  "bcrypt": "^6.0.0"

  // ❌ WRONG - AVOID
  "@types/bcrypt": "^5.0.0",     // Different major version
  "bcrypt": "^6.0.0"
  ```

- [ ] **Remove deprecated type stubs**
  ```json
  // ❌ REMOVE THESE
  "@types/ajv": "^1.0.4",      // Ajv v8 includes types
  "@types/helmet": "^4.0.0"     // Helmet includes types

  // ✅ KEEP THESE
  "@types/bcrypt": "^6.0.0"     // Still needed
  ```

- [ ] **Security audit clearance**
  ```bash
  npm audit --audit-level=moderate
  # Must pass with no high/moderate vulnerabilities
  ```

### **Phase 3: Testing Standards (25% weight)**
- [ ] **Server methods are idempotent**
  ```typescript
  // ✅ CORRECT - Clear server reference
  this.server.close(() => {
    this.server = undefined; // ✅ Idempotent
    resolve();
  });

  // ❌ WRONG - AVOID
  this.server.close(() => {
    // ❌ Doesn't clear reference, future calls fail
    resolve();
  });
  ```

- [ ] **Port logging accuracy**
  ```typescript
  // ✅ CORRECT - Log actual bound port
  const address = this.server?.address();
  const actualPort = (typeof address === 'string') ? port : address?.port || port;

  // ❌ WRONG - AVOID
  this.logServerStart(port); // ❌ Shows requested port, not actual
  ```

- [ ] **Test assertion uniqueness**
  ```typescript
  // ✅ CORRECT - Unique assertions
  expect(response.status).toBe(201);
  expect(response.body.success).toBe(true);
  expect(response.body.data).toHaveProperty('userId');

  // ❌ WRONG - AVOID
  expect(response.status).toBe(201);
  expect(response.body.success).toBe(true);
  expect(response.status).toBe(201);           // ❌ Duplicate
  expect(response.body.success).toBe(true);       // ❌ Duplicate
  ```

- [ ] **ADR-003 compliance verification**
  - Test isolation in `beforeEach`/`afterEach`
  - Clean server setup/teardown
  - No shared state between tests

### **Phase 4: Documentation Integrity (30% weight)**
- [ ] **Markdown lint compliance**
  ```bash
  npx markdownlint .
  # Must pass without MD040, MD036 violations
  ```

- [ ] **Path reference consistency**
  - All file paths use consistent format
  - No broken references across docs
  - Single source of truth for paths

- [ ] **Actionable documentation**
  ```markdown
  // ❌ WRONG - AVOID
  Next Steps: Continuar con implementación

  // ✅ CORRECT - Use
  Next Steps:
  1. **Cross-Component Integration**: Implement API → Domain → Repository validation con ADR-003 compliance
  2. **Advanced Performance Testing**: Escenarios de carga con múltiples usuarios concurrentes (k6 suggested)
  3. **Security Testing Framework**: Validación de input sanitization y protección contra inyección SQL/XSS
  ```

- [ ] **Status entry uniqueness**
  - Remove duplicate task entries
  - Mark legacy entries appropriately
  - Maintain single source of truth

---

## 🔍 **PRE-COMMIT VALIDATION COMMANDS**

### **Required Before Every Commit**
```bash
#!/bin/bash
echo "🔍 Running CodeRabbitAI Prevention Validation..."

# 1. Type Safety Check (25% weight)
echo "🔴 Checking Type Safety & Async..."
npx tsc --noEmit --strict
if [ $? -ne 0 ]; then
  echo "❌ TypeScript compilation failed"
  exit 1
fi
echo "✅ TypeScript compilation passed"

# 2. Dependency Management (20% weight)
echo "🟡 Checking Dependency Management..."
npm install --dry-run
if [ $? -ne 0 ]; then
  echo "❌ Dependency installation failed"
  exit 1
fi

npm audit --audit-level=moderate
if [ $? -ne 0 ]; then
  echo "❌ Security audit failed"
  exit 1
fi
echo "✅ Dependencies validated"

# 3. Testing Standards (25% weight)
echo "🔵 Checking Testing Standards..."
npm test -- --passWithNoTests
if [ $? -ne 0 ]; then
  echo "❌ Tests failed"
  exit 1
fi
echo "✅ Tests passed"

# 4. Documentation Integrity (30% weight)
echo "🟢 Checking Documentation Integrity..."
npx markdownlint .
if [ $? -ne 0 ]; then
  echo "❌ Markdown linting failed"
  exit 1
fi
echo "✅ Documentation validated"

echo "🎯 All validations passed - Ready for commit"
```

---

## 🚨 **COMMON PATTERNS TO PREVENT**

### **Pattern 1: Async/Sync Mismatches**
```typescript
// ❌ DETECTED PATTERN - AVOID
await server.start(); // ❌ server.start() returns void
await repository.save(); // ❌ save() returns void

// ✅ CORRECT PATTERN - USE
server.start(); // ✅ Synchronous call
await repository.saveAsync(); // ✅ Async method with Promise
```

### **Pattern 2: Dependency Incompatibility**
```json
{
  // ❌ PROBLEMATIC - AVOID
  "dependencies": {
    "bcrypt": "^6.0.0"
  },
  "devDependencies": {
    "@types/bcrypt": "^5.0.0"     // ❌ Major version mismatch
  },

  // ✅ CORRECT - USE
  "dependencies": {
    "bcrypt": "^6.0.0"
  },
  "devDependencies": {
    "@types/bcrypt": "^6.0.0"     // ✅ Same major version
  }
}
```

### **Pattern 3: Testing Infrastructure Issues**
```typescript
// ❌ DETECTED PATTERN - AVOID
// Server logging (shows requested port)
this.logServerStart(port); // ❌ Wrong when port=0

// Server stop (not idempotent)
this.server.close(resolve); // ❌ Doesn't clear reference

// Test assertions (duplicated)
expect(response.status).toBe(201);
expect(response.status).toBe(201); // ❌ Duplicate

// ✅ CORRECT PATTERN - USE
// Server logging (shows actual bound port)
const address = this.server?.address();
const actualPort = address?.port || port;
this.logServerStart(actualPort); // ✅ Accurate

// Server stop (idempotent)
this.server.close(() => {
  this.server = undefined; // ✅ Clear reference
  resolve();
});

// Test assertions (unique)
expect(response.status).toBe(201);
expect(response.body.success).toBe(true); // ✅ Different assertions
```

### **Pattern 4: Documentation Inconsistency**
```markdown
<!-- ❌ DETECTED PATTERN - AVOID -->
**APROBADO PARA MERGEAR**  <!-- ❌ Emphasis as heading -->

Next Steps: Continuar con implementación  <!-- ❌ Vague -->

[LINK](dev-docs/TASK-005-PROGRESS.md)  <!-- ✅ Consistent path format -->

<!-- ✅ CORRECT PATTERN - USE -->
### **APROBADO PARA MERGEAR**  <!-- ✅ Proper heading level -->

Next Steps:
1. **Cross-Component Integration**: API → Domain → Repository validation con ADR-003 compliance
2. **Advanced Performance Testing**: Escenarios de carga con múltiples usuarios concurrentes (k6 suggested) <!-- ✅ Specific -->

[LINK](dev-docs/TASK-005-PROGRESS.md)  <!-- ✅ Consistent path format -->
```

---

## 📊 **VALIDATION MATRIX**

| Category | Weight | Check Command | Success Criteria |
|----------|--------|---------------|------------------|
| Type Safety | 25% | `npx tsc --noEmit --strict` | Zero compilation errors |
| Dependencies | 20% | `npm audit --audit-level=moderate` | No high/moderate vulns |
| Testing | 25% | `npm test` | All tests passing |
| Documentation | 30% | `npx markdownlint .` | Zero lint violations |

**Minimum Passing Score**: 90% total weight
**Recommended Passing Score**: 95% total weight

---

## 🎯 **EXPECTED OUTCOMES**

### **Immediate Benefits (Week 1-2)**
- **90% reduction** in async/await and dependency issues
- **Faster PR reviews** with fewer systematic problems
- **Higher code consistency** across team members

### **Long-term Benefits (Month 1-3)**
- **85% total reduction** in CodeRabbitAI issues (18 → <3)
- **Zero systematic bugs** in categories 1-4
- **Improved developer experience** with automated validation

---

## 🚀 **IMPLEMENTATION WORKFLOW**

### **Before Starting Task**
1. [ ] Review this enhanced template thoroughly
2. [ ] Set up local validation environment
3. [ ] Test all validation commands locally

### **During Development**
1. [ ] Run validation after each major change
2. [ ] Fix validation failures immediately
3. [ ] Maintain 90%+ validation matrix score

### **Before Commit**
1. [ ] Complete all mandatory validations
2. [ ] Run full validation suite
3. [ ] Verify 95%+ matrix score
4. [ ] Commit with validation status in message

---

## 📞 **EMERGENCY PROTOCOLS**

### **Validation Failures**
1. **Type Check Failures**: Review async/await patterns, method return types
2. **Dependency Failures**: Check version compatibility, update if needed
3. **Test Failures**: Verify test isolation, server management
4. **Documentation Failures**: Run `markdownlint --fix`, review formatting

### **Emergency Escalation**
If validation blocks critical work:
1. Document specific blocker
2. Propose template adjustment
3. Get approval from VALIDADOR
4. Update templates accordingly

---

## ✅ **SUCCESS DEFINITION**

A task is successful when:
- **All validations pass** with 95%+ matrix score
- **Zero CodeRabbitAI systematic issues** (patterns 1-4)
- **Quality gates maintained** (tests, performance, documentation)
- **PR approved** with minimal review cycles

---

**Template Version**: 2.2 Enhanced
**Target**: 85% reduction in CodeRabbitAI issues
**Validation**: Automated pre-commit + manual checklist
**Success Rate Target**: 95%+ validation compliance