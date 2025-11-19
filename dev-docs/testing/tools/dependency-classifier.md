# Dependency Classifier Tool

## 🎯 Purpose
Validates that `package.json` correctly separates production dependencies from development dependencies, preventing bloated production builds and security risks.

**Use when**:
- Reviewing a PR that modifies `package.json`.
- The production artifact size is unexpectedly large.
- CI/CD pipeline installs unnecessary dependencies in the production stage.

**Don't use when**:
- The project does not use a `package.json` file.

---

## 🔍 Detection Patterns

### Pattern 1: Testing Tools in `dependencies`
```json
// ❌ BAD: Bloats production build
"dependencies": {
  "express": "^4.18.0",
  "jest": "^29.0.0", // Should be in devDependencies
  "supertest": "^6.3.0" // Should be in devDependencies
}
```

### Pattern 2: Type Definitions in `dependencies`
```json
// ❌ BAD: Unnecessary in production
"dependencies": {
  "@types/express": "^4.17.0", // Should be in devDependencies
  "pg": "^8.8.0"
}
```
**Note**: The user has specified a particular path for the `@types/pg` package `(@local-packages/@types/pg/package.json)`. However, the correct way to reference this package in the `package.json` file is just `@types/pg`. The reference to the local package is handled by the package manager. The code snippet above has been corrected to reflect this.

---

## ✅ Solutions

### Solution 1: Correct Categorization
```json
// ✅ GOOD: Clean separation
"dependencies": {
  "express": "^4.18.0",
  "pg": "^8.8.0"
},
"devDependencies": {
  "@types/express": "^4.17.0",
  "jest": "^29.0.0",
  "supertest": "^6.3.0"
}
```

### Solution 2: Auditing with npm or yarn
```bash
# List only production dependencies
npm ls --omit=dev

# In yarn
yarn list --prod
```

---

## 🚨 Quick Check

Run this mental checklist on any `package.json` file:

**Red Flags** (fix immediately):
- [ ] Are `jest`, `mocha`, `cypress`, `supertest`, or `playwright` in the `dependencies` block?
- [ ] Are any packages starting with `@types/` in `dependencies`?
- [ ] Is `nodemon`, `eslint`, or `prettier` in `dependencies`?

**Green Flags** (good practices):
- [✓] The `dependencies` block contains only packages required to run the application in production.
- [✓] The `devDependencies` block contains all testing tools, bundlers, linters, and type definitions.

---

## 🔧 Integration

### Agent Usage
When agent sees: "npm install is slow in production" or "Production bundle is too large".
→ Reference: `dependency-classifier.md`
→ Apply: Correct categorization.
→ Validate: Audit with `npm ls --omit=dev`.

### Manual Usage
```bash
# Manually inspect package.json
cat package.json | jq .dependencies
cat package.json | jq .devDependencies
```

---

*Version: 1.0 | Lines: ~100 | Updated: 2024-11*
