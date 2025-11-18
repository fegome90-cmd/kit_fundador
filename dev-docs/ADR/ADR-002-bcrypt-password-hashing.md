# ADR-002: bcrypt Password Hashing Implementation

**Status:** ✅ Accepted
**Date:** 2025-11-18
**Deciders:** Security Team, Engineering Lead
**Priority:** 🔴 CRITICAL

---

## Context and Problem Statement

The current `Password` value object implementation uses a placeholder hashing strategy that concatenates a prefix (`"hashed_"`) with the plaintext password. This creates a **critical security vulnerability** where passwords are stored in effectively plaintext format in the database.

**Current Implementation:**
```typescript
const hashed = `${HASH_PLACEHOLDER_PREFIX}${plainPassword}`;
```

**Problems:**
- ❌ Passwords recoverable from database
- ❌ No cryptographic security
- ❌ Violates GDPR, PCI-DSS, SOC2 compliance
- ❌ Vulnerable to rainbow table attacks
- ❌ Vulnerable to timing attacks
- ❌ **Production Blocker**

## Decision Drivers

1. **Security:** Must use industry-standard cryptographic hashing
2. **Compliance:** OWASP, GDPR, PCI-DSS requirements
3. **Performance:** Balance between security and response time
4. **Simplicity:** Well-tested, widely-adopted library
5. **Future-proofing:** Algorithm should remain secure for 5+ years

## Considered Options

### Option 1: bcrypt ⭐ **SELECTED**
- **Pros:**
  - ✅ Industry standard for password hashing (20+ years)
  - ✅ Built-in salt generation
  - ✅ Configurable work factor (cost parameter)
  - ✅ Widely tested and audited
  - ✅ Native Node.js library available
  - ✅ Resistant to GPU/ASIC attacks
  - ✅ Excellent library support (`bcrypt` package)
- **Cons:**
  - ⚠️ Limited to 72-byte passwords
  - ⚠️ Older algorithm than Argon2

### Option 2: Argon2
- **Pros:**
  - ✅ Winner of Password Hashing Competition (2015)
  - ✅ More modern algorithm
  - ✅ Configurable memory hardness
  - ✅ Better resistance to specialized hardware
- **Cons:**
  - ❌ Requires native compilation (node-gyp)
  - ❌ More complex configuration
  - ❌ Less mature ecosystem in Node.js
  - ❌ Potential deployment issues

### Option 3: scrypt
- **Pros:**
  - ✅ Memory-hard algorithm
  - ✅ Good resistance to hardware attacks
- **Cons:**
  - ❌ Less widespread adoption than bcrypt
  - ❌ More complex parameter tuning
  - ❌ Fewer Node.js library options

### Option 4: PBKDF2
- **Pros:**
  - ✅ NIST-approved standard
  - ✅ Native Node.js support
- **Cons:**
  - ❌ More vulnerable to GPU attacks
  - ❌ Requires careful iteration count selection
  - ❌ Not as recommended as bcrypt/Argon2

## Decision Outcome

**Chosen option:** bcrypt with 12 salt rounds

### Justification

1. **Battle-tested:** bcrypt has 20+ years of security scrutiny
2. **Simplicity:** Pure JavaScript implementation, no native compilation required
3. **Performance:** 12 rounds provides ~300-500ms hashing time (acceptable UX)
4. **Compliance:** Meets OWASP, NIST, GDPR requirements
5. **Ecosystem:** Mature `bcrypt` npm package with 2M+ weekly downloads
6. **Future-proof:** Can increase salt rounds as hardware improves

### Implementation Details

**Library:** `bcrypt` ^5.1.1
**Salt Rounds:** 12 (default, configurable via environment)
**Format:** `$2b$12$...` (bcrypt standard)

```typescript
// Password creation
static async create(plainPassword: string): Promise<Password> {
  const saltRounds = 12;
  const hashed = await bcrypt.hash(plainPassword, saltRounds);
  return new Password(hashed);
}

// Password verification
async matches(plainPassword: string): Promise<boolean> {
  return bcrypt.compare(plainPassword, this._hashedValue);
}
```

### Configuration

**Default Salt Rounds:** 12
- Provides ~300-500ms hashing time on modern hardware
- Balances security vs. user experience
- Can be increased to 13-15 for high-security applications

**Environment Variable (Optional):**
```bash
PASSWORD_SALT_ROUNDS=12
```

## Consequences

### Positive

✅ **Eliminates critical security vulnerability**
✅ **Compliance with security standards**
✅ **Production-ready password security**
✅ **Protection against rainbow tables**
✅ **Protection against timing attacks**
✅ **Automatic salt generation**
✅ **Industry-standard format**

### Negative

⚠️ **Breaking change:** All `Password.create()` and `matches()` calls become async
⚠️ **Migration required:** Existing hashed passwords (if any) need rehashing
⚠️ **Performance:** ~300-500ms per password operation (acceptable for auth)

### Neutral

ℹ️ **Dependency added:** `bcrypt` (~800KB)
ℹ️ **Test updates required:** All password-related tests need `await`

## Migration Strategy

### Phase 1: Update Code (This ADR)
1. Install bcrypt dependency
2. Refactor Password value object
3. Update all application layer code
4. Update all tests

### Phase 2: Database Migration (If Needed)
If production database has existing users with placeholder hashes:
```typescript
// Progressive rehashing on login
async authenticateUser(email, password) {
  const user = await findByEmail(email);

  // Check if old placeholder format
  if (user.password.hasOldFormat()) {
    // Verify with old method
    if (user.password.matchesOldFormat(password)) {
      // Rehash with bcrypt
      user.password = await Password.create(password);
      await save(user);
    }
  } else {
    // Use bcrypt verification
    return user.password.matches(password);
  }
}
```

## Compliance Mapping

| Standard | Requirement | bcrypt Compliance |
|----------|-------------|-------------------|
| **OWASP** | Use adaptive hashing | ✅ bcrypt is adaptive |
| **OWASP** | Minimum 10 iterations | ✅ 12 rounds = 4,096 iterations |
| **NIST** | Use approved algorithm | ✅ bcrypt is approved |
| **PCI-DSS** | Strong cryptography | ✅ bcrypt provides strong crypto |
| **GDPR** | Data protection by design | ✅ Irreversible hashing |
| **SOC2** | Access control | ✅ Secure password storage |

## References

- [OWASP Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
- [bcrypt npm package](https://www.npmjs.com/package/bcrypt)
- [bcrypt specification](https://en.wikipedia.org/wiki/Bcrypt)
- [NIST SP 800-63B](https://pages.nist.gov/800-63-3/sp800-63b.html)

## Related ADRs

- ADR-001: ADR Integration System
- (Future) ADR-003: Password Policy Requirements

---

**Reviewers:** Security Team, Backend Team
**Last Updated:** 2025-11-18
**Next Review:** 2026-11-18 (annual security review)
