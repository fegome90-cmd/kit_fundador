# Domain Invariants

> Reglas de negocio que SIEMPRE deben ser verdaderas. Violación = bug crítico.

## ¿Qué es un Invariante?

Un invariante es una condición que debe ser verdadera en TODO momento para que el sistema sea consistente.

**Ejemplos**:
- ✅ "El balance de cuenta nunca puede ser negativo"
- ✅ "Un pedido cerrado no puede modificarse"
- ✅ "Email debe ser único por usuario"
- ❌ "Los usuarios prefieren el color azul" (preferencia, no invariante)

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

### Pattern: Property-Based Testing

Para invariantes complejos, usar property-based testing:

```typescript
import { fc } from 'fast-check';

describe('Order Invariants - Property Tests', () => {
  it('total always equals sum of lines (property)', () => {
    fc.assert(
      fc.property(
        fc.array(orderLineArbitrary(), { minLength: 1 }),
        (lines) => {
          const order = new Order();
          lines.forEach(line => order.addLine(line));
          
          const expectedTotal = lines.reduce(
            (sum, line) => sum + line.subtotal.amount,
            0
          );
          
          expect(order.total.amount).toBe(expectedTotal);
        }
      )
    );
  });
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
