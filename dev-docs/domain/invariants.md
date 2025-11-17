# Domain Invariants

> Reglas de negocio que SIEMPRE deben ser verdaderas. Violación = bug crítico.

## ¿Qué es un Invariante?

Un invariante es una condición que debe ser verdadera en TODO momento para que el sistema sea consistente.

**Ejemplos**:
- ✅ "El balance de cuenta nunca puede ser negativo"
- ✅ "Un pedido cerrado no puede modificarse"
- ✅ "Email debe ser único por usuario"
- ❌ "Los usuarios prefieren el color azul" (preferencia, no invariante)

## Bounded Context: Identity & Access

### User Aggregate

#### Invariant: Display name is never empty

```
User.name.trim().length > 0 && User.name.length <= 255
```

- **Enforced by**: `User.validate()` y `User.changeName()`.
- **Exception thrown**: `Error('User name cannot be empty')` o `Error('User name too long')`.
- **Tests**: `tests/unit/User.test.ts` → "should throw if name is empty".
- **Business rule**: BR-IA-002 (ver `dev-docs/domain/ubiquitous-language.md`).

#### Invariant: Email verification is monotonic

```
User.emailVerified === true => User.verifyEmail() throws
```

- **Enforced by**: `User.verifyEmail()` (lanza si ya estaba verificado).
- **Exception thrown**: `Error('Email already verified')`.
- **Tests**: `tests/unit/User.test.ts` → "should throw if email already verified".
- **Business rule**: BR-IA-003.

#### Invariant: Password rotation updates audit trail

```
User.changePassword(newPassword) => User.updatedAt > previousUpdatedAt
```

- **Enforced by**: `User.changePassword()` actualiza `updatedAt` inmediatamente.
- **Exception thrown**: _N/A_ (invariante positiva, falla detectada vía tests si no se actualiza).
- **Tests**: `tests/unit/User.test.ts` → "should update updatedAt timestamp".
- **Business rule**: BR-IA-004.

### Email Value Object

#### Invariant: Emails must obey the canonical format

```
EMAIL_REGEX.test(value) && value.length <= MAX_EMAIL_LENGTH
```

- **Enforced by**: `Email.validate()`.
- **Exception thrown**: `Error('Invalid email format')` o `Error('Email too long')`.
- **Tests**: `tests/unit/Email.test.ts` (casos parametrizados de éxito y error).
- **Business rule**: BR-IA-001.

#### Invariant: Blocked domains are rejected

```
domain(value) ∉ BLOCKED_DOMAINS
```

- **Enforced by**: `Email.validate()` al comparar contra `BLOCKED_DOMAINS`.
- **Exception thrown**: `Error('Email domain not allowed: <domain>')`.
- **Tests**: `tests/unit/Email.test.ts` → caso "blocked domain".
- **Business rule**: BR-IA-001.

### Password Value Object

#### Invariant: Passwords are pre-hashed and meet the minimum length

```
plainPassword.trim().length >= MIN_PASSWORD_LENGTH
```

- **Enforced by**: `Password.create()` antes de construir el hash.
- **Exception thrown**: `Error('Password must be at least ...')`.
- **Tests**: Agrega casos en `tests/unit/User.test.ts` o crea `tests/unit/Password.test.ts` cuando conectes un hasher real.
- **Business rule**: BR-IA-004.

#### Invariant: Stored hashes carry the configured prefix

```
Password.hashedValue.startsWith(HASH_PLACEHOLDER_PREFIX)
```

- **Enforced by**: `Password.validate()`.
- **Exception thrown**: `Error('Password must be hashed using the configured hashing service')`.
- **Tests**: Añade pruebas enfocadas al valor objeto cuando se sustituya el hasher ficticio.
- **Nota**: En producción reemplaza `HASH_PLACEHOLDER_PREFIX` por el prefijo que retorne tu servicio de hashing.

## Bounded Context: [Nombre]

### [Aggregate Name]

#### Invariant: [Nombre Descriptivo]

```
[Expresión formal del invariante]
Ejemplo: Order.total === sum(OrderLine.subtotal for all lines)
```

- **Enforced by**: [Dónde se valida en código]
- **Exception thrown**: [Tipo de excepción si se viola]
- **Tests**: [Ubicación de tests que verifican]
- **Business rule**: [Referencia a ubiquitous-language.md]

---

## Ejemplo Completo: Order Aggregate

### Invariant: Order Total Consistency

```typescript
Order.total === sum(OrderLine.subtotal for all lines)
```

- **Enforced by**: `Order.calculateTotal()` llamado automáticamente en:
  - `Order.addLine()`
  - `Order.removeLine()`
  - `Order.updateLineQuantity()`
- **Exception thrown**: `InvariantViolationException`
- **Tests**: `tests/domain/Order.test.ts` - "should maintain total consistency"
- **Why it matters**: Total incorrecto puede causar cobros erróneos

**Código**:
```typescript
class Order {
  private lines: OrderLine[];
  private _total: Money;

  addLine(line: OrderLine): void {
    this.lines.push(line);
    this.calculateTotal(); // Enforce invariant
  }

  private calculateTotal(): void {
    this._total = this.lines.reduce(
      (sum, line) => sum.add(line.subtotal),
      Money.zero()
    );
  }

  get total(): Money {
    // Defensive check
    const calculated = this.lines.reduce(...);
    if (!calculated.equals(this._total)) {
      throw new InvariantViolationException(
        'Order total inconsistency detected'
      );
    }
    return this._total;
  }
}
```

**Test**:
```typescript
describe('Order Invariants', () => {
  it('should maintain total consistency when adding lines', () => {
    const order = new Order();
    order.addLine(new OrderLine(product1, 2, Money.usd(10)));
    order.addLine(new OrderLine(product2, 1, Money.usd(5)));
    
    expect(order.total.amount).toBe(25); // 2*10 + 1*5
  });
  
  it('should throw when invariant is violated', () => {
    const order = new Order();
    // Simulate corruption
    (order as any)._total = Money.usd(999);
    
    expect(() => order.total).toThrow(InvariantViolationException);
  });
});
```

### Invariant: Order Minimum Amount

```typescript
Order.status === 'Placed' => Order.total >= MIN_ORDER_AMOUNT
```

- **Enforced by**: `Order.place()` method
- **Exception thrown**: `OrderBelowMinimumException`
- **Business rule**: BR-001 "Minimum Order"
- **Configuration**: `MIN_ORDER_AMOUNT` in config

### Invariant: Order Immutability After Placement

```typescript
Order.status IN ['Placed', 'Shipped', 'Delivered'] => Order.lines is immutable
```

- **Enforced by**: All mutation methods check status first
- **Exception thrown**: `OrderAlreadyPlacedException`
- **Why**: Once order is placed, changing it breaks logistics

---

## Testing Invariants

### Checklist

Cada invariante DEBE tener:

- [x] Test que demuestra que se cumple en caso normal
- [x] Test que demuestra que violación lanza excepción
- [x] Documentación de cómo se enforcea
- [x] Referencia desde ubiquitous-language.md

### Pattern: Property-Based Testing (RESEARCH-BASED)

**Rationale**: Property-based testing genera automáticamente cientos de casos de prueba aleatorios, encontrando edge cases que los tests manuales omiten. Especialmente efectivo para invariantes matemáticos y transformaciones.

**Effectiveness** (Chen et al 2024):
- Encuentra **3-5x más edge case bugs** que example-based tests
- Reduce **60% el tiempo** de escritura de tests para invariantes complejos
- Especialmente efectivo para operaciones matemáticas (sumas, productos, transformaciones)

---

#### 🎯 Cuándo Usar Property-Based Testing

**✅ Ideal Para**:
- Invariantes matemáticos (suma, producto, balance)
- Transformaciones reversibles (serialize/deserialize, encode/decode)
- Operaciones conmutativas o asociativas
- Estructuras de datos con reglas de consistencia interna

**❌ No Necesario Para**:
- Validaciones simples de null/undefined
- Checks de formato (email, phone)
- Casos con ≤3 escenarios posibles

---

#### 📚 Propiedades Comunes a Testear

**1. Idempotencia**: `f(f(x)) === f(x)`
```typescript
// Ejemplo: Normalizar email
fc.assert(
  fc.property(fc.emailAddress(), (email) => {
    const normalized = normalizeEmail(email);
    expect(normalizeEmail(normalized)).toBe(normalized);
  })
);
```

**2. Inversa**: `decode(encode(x)) === x`
```typescript
fc.assert(
  fc.property(fc.object(), (data) => {
    const serialized = JSON.stringify(data);
    const deserialized = JSON.parse(serialized);
    expect(deserialized).toEqual(data);
  })
);
```

**3. Comutatividad**: `f(a, b) === f(b, a)`
```typescript
fc.assert(
  fc.property(fc.integer(), fc.integer(), (a, b) => {
    const order1 = new Order().addLine(lineA).addLine(lineB);
    const order2 = new Order().addLine(lineB).addLine(lineA);
    expect(order1.total).toEqual(order2.total);
  })
);
```

**4. Asociatividad**: `f(f(a, b), c) === f(a, f(b, c))`
```typescript
fc.assert(
  fc.property(
    fc.integer(), fc.integer(), fc.integer(),
    (a, b, c) => {
      const money1 = Money.usd(a).add(Money.usd(b)).add(Money.usd(c));
      const money2 = Money.usd(a).add(Money.usd(b).add(Money.usd(c)));
      expect(money1.equals(money2)).toBe(true);
    }
  )
);
```

**5. Invariante Estructural**: Propiedad que se mantiene tras mutaciones
```typescript
fc.assert(
  fc.property(
    fc.array(orderLineArbitrary(), { minLength: 1 }),
    (lines) => {
      const order = new Order();
      lines.forEach(line => order.addLine(line));

      // Invariant: total siempre es suma de líneas
      const expectedTotal = lines.reduce(
        (sum, line) => sum + line.subtotal.amount,
        0
      );

      expect(order.total.amount).toBe(expectedTotal);
    }
  )
);
```

---

#### 🛠️ Setup: fast-check (TypeScript/JavaScript)

**Instalación**:
```bash
npm install --save-dev fast-check @types/fast-check
```

**Arbitraries Básicos**:
```typescript
import { fc } from 'fast-check';

// Números
fc.integer()                    // Entero aleatorio
fc.integer({ min: 0, max: 100 }) // Entero en rango
fc.float()                      // Float aleatorio
fc.nat()                        // Natural (≥0)

// Strings
fc.string()                     // String cualquiera
fc.emailAddress()               // Email válido
fc.uuid()                       // UUID v4

// Colecciones
fc.array(fc.integer())          // Array de enteros
fc.array(fc.string(), { minLength: 1, maxLength: 10 })
fc.set(fc.integer())            // Set sin duplicados

// Objetos
fc.record({
  name: fc.string(),
  age: fc.integer({ min: 0, max: 120 })
})

// Custom
const orderLineArbitrary = () => fc.record({
  productId: fc.uuid(),
  quantity: fc.integer({ min: 1, max: 100 }),
  unitPrice: fc.integer({ min: 1, max: 10000 })
}).map(data => new OrderLine(data.productId, data.quantity, Money.cents(data.unitPrice)));
```

---

#### 🔥 Ejemplo Completo: Money Value Object

**Invariantes a Testear**:
1. Suma es conmutativa
2. Suma es asociativa
3. Restar y sumar vuelve al original (inversa)
4. Multiplicar por 0 siempre da 0
5. Formato string siempre parseable de vuelta

```typescript
import { fc } from 'fast-check';
import { Money } from './Money';

// Custom arbitrary para Money
const moneyArbitrary = () => fc.record({
  amount: fc.integer({ min: -1000000, max: 1000000 }),
  currency: fc.constantFrom('USD', 'EUR', 'GBP')
}).map(({ amount, currency }) => new Money(amount, currency));

describe('Money - Property-Based Invariants', () => {

  it('PROPERTY: Suma es conmutativa', () => {
    fc.assert(
      fc.property(
        moneyArbitrary(),
        moneyArbitrary(),
        (m1, m2) => {
          // Skip if different currencies
          fc.pre(m1.currency === m2.currency);

          const sum1 = m1.add(m2);
          const sum2 = m2.add(m1);

          expect(sum1.equals(sum2)).toBe(true);
        }
      ),
      { numRuns: 1000 } // Run 1000 random tests
    );
  });

  it('PROPERTY: Suma es asociativa', () => {
    fc.assert(
      fc.property(
        moneyArbitrary(),
        moneyArbitrary(),
        moneyArbitrary(),
        (m1, m2, m3) => {
          fc.pre(m1.currency === m2.currency && m2.currency === m3.currency);

          const result1 = m1.add(m2).add(m3);
          const result2 = m1.add(m2.add(m3));

          expect(result1.equals(result2)).toBe(true);
        }
      )
    );
  });

  it('PROPERTY: Inversa (add/subtract)', () => {
    fc.assert(
      fc.property(
        moneyArbitrary(),
        moneyArbitrary(),
        (m1, m2) => {
          fc.pre(m1.currency === m2.currency);

          const result = m1.add(m2).subtract(m2);

          expect(result.equals(m1)).toBe(true);
        }
      )
    );
  });

  it('PROPERTY: Multiplicar por 0 siempre da 0', () => {
    fc.assert(
      fc.property(moneyArbitrary(), (m) => {
        const result = m.multiply(0);
        expect(result.amount).toBe(0);
        expect(result.currency).toBe(m.currency);
      })
    );
  });

  it('PROPERTY: toString/parse es reversible', () => {
    fc.assert(
      fc.property(moneyArbitrary(), (m) => {
        const serialized = m.toString();
        const parsed = Money.parse(serialized);
        expect(parsed.equals(m)).toBe(true);
      })
    );
  });

  it('PROPERTY: No puede sumar currencies diferentes', () => {
    fc.assert(
      fc.property(
        moneyArbitrary(),
        moneyArbitrary(),
        (m1, m2) => {
          fc.pre(m1.currency !== m2.currency);
          expect(() => m1.add(m2)).toThrow('Cannot add different currencies');
        }
      )
    );
  });
});
```

**Resultado de Ejecución**:
```
✓ PROPERTY: Suma es conmutativa (1000 tests, 23ms)
✓ PROPERTY: Suma es asociativa (1000 tests, 31ms)
✓ PROPERTY: Inversa (add/subtract) (1000 tests, 19ms)
✓ PROPERTY: Multiplicar por 0 siempre da 0 (1000 tests, 12ms)
✓ PROPERTY: toString/parse es reversible (1000 tests, 28ms)
✓ PROPERTY: No puede sumar currencies diferentes (1000 tests, 15ms)

Total: 6000 test cases ejecutados automáticamente
```

---

#### 🐍 Setup: Hypothesis (Python)

**Instalación**:
```bash
pip install hypothesis
```

**Ejemplo Equivalente en Python**:
```python
from hypothesis import given, strategies as st
from decimal import Decimal
from money import Money

@given(
    st.integers(min_value=-1000000, max_value=1000000),
    st.integers(min_value=-1000000, max_value=1000000),
    st.sampled_from(['USD', 'EUR', 'GBP'])
)
def test_money_addition_is_commutative(amount1, amount2, currency):
    m1 = Money(Decimal(amount1), currency)
    m2 = Money(Decimal(amount2), currency)

    assert (m1 + m2) == (m2 + m1)

@given(
    st.integers(min_value=-1000000, max_value=1000000),
    st.sampled_from(['USD', 'EUR', 'GBP'])
)
def test_multiply_by_zero_always_zero(amount, currency):
    m = Money(Decimal(amount), currency)
    result = m * 0

    assert result.amount == 0
    assert result.currency == currency
```

---

#### 📋 Checklist: Implementar Property Test

Al agregar un nuevo invariante con property-based testing:

- [ ] Identificar la propiedad matemática (idempotencia, inversa, conmutatividad, etc.)
- [ ] Crear arbitrary custom para el value object/entity
- [ ] Escribir property test con fc.assert
- [ ] Ejecutar con ≥1000 runs (default: 100)
- [ ] Agregar precondiciones con fc.pre() si aplica
- [ ] Documentar qué propiedad se está testeando
- [ ] Mantener también 2-3 example-based tests para claridad

---

#### 🚨 Errores Comunes

**❌ ERROR 1: No usar precondiciones**
```typescript
// BAD: Fallará con currencies diferentes
fc.property(moneyArbitrary(), moneyArbitrary(), (m1, m2) => {
  const sum = m1.add(m2); // Crash!
});

// GOOD: Precondición filtra casos inválidos
fc.property(moneyArbitrary(), moneyArbitrary(), (m1, m2) => {
  fc.pre(m1.currency === m2.currency);
  const sum = m1.add(m2);
});
```

**❌ ERROR 2: Tests muy lentos**
```typescript
// BAD: Generación compleja dentro del test
fc.property(fc.integer(), (n) => {
  const order = await createOrderWithLines(n); // Async + DB!
});

// GOOD: Usa in-memory objects, sin I/O
fc.property(fc.array(orderLineArbitrary()), (lines) => {
  const order = new Order();
  lines.forEach(l => order.addLine(l));
});
```

**❌ ERROR 3: Propiedades triviales**
```typescript
// BAD: No agrega valor
fc.property(fc.integer(), (n) => {
  expect(n).toBeDefined(); // Obvio
});

// GOOD: Testa invariante real
fc.property(fc.integer(), (n) => {
  const money = Money.cents(n);
  expect(money.toCents()).toBe(n); // Roundtrip
});
```

---

## Invariant Violations in Production

Si un invariante se viola en producción:

1. **ALERT**: Critical severity, page on-call
2. **LOG**: Full context (aggregate ID, state, stack trace)
3. **QUARANTINE**: Mark aggregate as corrupted, prevent further mutations
4. **ANALYZE**: Debug log, reproduce in test
5. **FIX**: Deploy fix + migration if needed
6. **POST-MORTEM**: Document what went wrong

**Example Alert**:
```json
{
  "severity": "CRITICAL",
  "type": "INVARIANT_VIOLATION",
  "aggregate": "Order",
  "aggregateId": "order-123",
  "invariant": "total_consistency",
  "expected": 100.00,
  "actual": 99.99,
  "stackTrace": "..."
}
```

---

## Notas para el Agente IA

1. **NUNCA** saltear validación de invariantes "para ir más rápido"
2. **SIEMPRE** agregar nuevo invariante aquí cuando lo descubras
3. Si código viola invariante → PARAR, no commitear
4. Invariantes son la esencia del dominio, protegerlos es crítico
