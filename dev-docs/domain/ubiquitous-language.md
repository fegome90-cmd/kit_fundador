# Ubiquitous Language

> Lenguaje común entre negocio y desarrollo. Usar ESTOS términos en código, docs, conversaciones.

## Bounded Context: [Nombre del Contexto]

### Core Concepts

| Término | Definición | Sinónimos Prohibidos | Ejemplos en Código |
|---------|------------|---------------------|-------------------|
| **[Término de Negocio]** | [Definición precisa del dominio] | [Lo que NO es] | `class TerminoNegocio` |

### Entities

| Entidad | Identidad | Responsabilidad | Aggregate Root |
|---------|-----------|-----------------|----------------|
| **[Entity]** | [Qué la identifica] | [Qué hace] | ✓/✗ |

### Value Objects

| Value Object | Propósito | Validaciones | Inmutable |
|--------------|-----------|--------------|-----------|
| **[VO]** | [Para qué existe] | [Reglas] | ✓ |

### Aggregates

| Aggregate | Root Entity | Invariantes | Bounded Entities |
|-----------|-------------|-------------|------------------|
| **[Aggregate]** | [Root] | [Reglas que SIEMPRE son verdad] | [Entities incluidas] |

### Domain Events

| Evento | Cuándo ocurre | Datos que lleva | Consecuencias |
|--------|---------------|-----------------|---------------|
| `[Event]Happened` | [Trigger] | [Payload] | [Qué pasa después] |

### Business Rules

1. **[Nombre de Regla]**: [Descripción clara]
   - *Ejemplo*: Si X entonces Y
   - *Invariante*: Z siempre debe ser verdadero
   - *Excepción*: En caso A, se permite B
   - *Código*: Enforced en `[Class].[method]()`

### Anti-Glossary

> Términos PROHIBIDOS porque causan confusión

| ❌ No Usar | ✅ Usar En Su Lugar | Por Qué |
|-----------|-------------------|---------|
| "Data" | Nombre específico del concepto | Vago, no agrega significado |
| "Manager" | Servicio específico | Oculta responsabilidad real |
| "Helper" | [Nombre descriptivo] | No dice qué ayuda |
| "Util" | [Nombre específico] | Cajón de sastre |

---

## Ejemplo Completo: E-commerce Context

### Bounded Context: Order Management

#### Core Concepts

| Término | Definición | No es | Código |
|---------|------------|-------|--------|
| **Order** | Solicitud de compra de un Customer con 1+ Items | Cart, Purchase | `class Order` |
| **OrderLine** | Item específico dentro de Order (producto + cantidad) | Product | `class OrderLine` |
| **PlaceOrder** | Acción de convertir Cart en Order | Checkout | `PlaceOrderCommand` |

#### Business Rules

1. **Order Minimum**: Order debe tener total >= $10 USD
   - Enforced en: `Order.place()` method
   - Exception: `OrderBelowMinimumException`

2. **Stock Reservation**: Al PlaceOrder, stock debe reservarse atómicamente
   - Enforced en: `PlaceOrderHandler`
   - Rollback si falla payment

3. **Price Snapshot**: Precio en OrderLine es del momento de creación
   - Cambios futuros en Product.price NO afectan Orders existentes
   - Enforced en: `OrderLine` constructor

#### Domain Events

| Evento | Cuándo | Datos | Consumidores |
|--------|--------|-------|--------------|
| `OrderPlaced` | Order.place() exitoso | orderId, customerId, total, items | Inventory, Billing, Notification |
| `OrderCancelled` | Order.cancel() llamado | orderId, reason | Inventory (release), Billing (refund) |

---

## Notas para el Agente IA

1. **OBLIGATORIO**: Usar EXACTAMENTE estos términos en el código
2. **PROHIBIDO**: Inventar sinónimos o traducciones
3. Al agregar nuevo término:
   - Consultar con domain expert
   - Agregar a esta tabla
   - Actualizar `.context/project-state.json`
4. Si encuentras término ambiguo → parar y aclarar
