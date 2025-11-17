# Ubiquitous Language

> Lenguaje común entre negocio y desarrollo. Usar ESTOS términos en código, docs, conversaciones.

## Bounded Context: Identity & Access

Este es el primer bounded context **oficial** del starkit. Resume la semántica del aggregate `User` y los value objects que lo acompañan. El código de referencia vive en `src/domain/entities/User.ts` y `src/domain/value-objects/*`.

### Core Concepts

| Término | Definición | Sinónimos Prohibidos | Ejemplos en Código |
|---------|------------|---------------------|-------------------|
| **User Account** | Identidad digital única que concentra email, nombre visible, rol y estado de verificación. | Perfil, customer, member | `src/domain/entities/User.ts` |
| **Credential** | Representación segura de un secreto autenticador (hash, metadata, fecha de rotación). | Password plano, pwd, key | `src/domain/value-objects/Password.ts` |
| **Verification Status** | Marca booleana que indica si el email fue probado por un flujo externo. | Flag, toggle, validated | `User.verifyEmail()` |

### Entities

| Entidad | Identidad | Responsabilidad | Aggregate Root |
|---------|-----------|-----------------|----------------|
| **User** | `UserId` (`crypto.randomUUID()` o proveedor equivalente) | Orquestar credenciales, email verificado y rol asignado. | ✓ |
| **DomainEvent** (abstracta) | `eventId` + `occurredOn` | Contrato para propagar cambios del aggregate. | ✗ (base class) |

### Value Objects

| Value Object | Propósito | Validaciones | Inmutable |
|--------------|-----------|--------------|-----------|
| **Email** | Garantizar formato RFC 5322 acotado, longitud y dominios permitidos antes de persistir. | `EMAIL_REGEX`, `MAX_EMAIL_LENGTH` (=255), `BLOCKED_DOMAINS`. | ✓ |
| **Password** | Representar hashes/secretos ya procesados y asegurar requisitos mínimos de longitud/entropía. | `MIN_PASSWORD_LENGTH`, prefijo `HASH_PLACEHOLDER_PREFIX`. | ✓ |

### Aggregates

| Aggregate | Root Entity | Invariantes | Bounded Entities |
|-----------|-------------|-------------|------------------|
| **UserAccount** | `User` | - El nombre nunca es vacío.<br>- `emailVerified` solo puede pasar de `false` → `true`.<br>- Cualquier cambio relevante actualiza `updatedAt`. | `User` + value objects `Email`, `Password` |

### Domain Events

| Evento | Cuándo ocurre | Datos que lleva | Consecuencias |
|--------|---------------|-----------------|---------------|
| `UserCreatedEvent` | `User.create()` finaliza exitosamente. | `userId`, `email`, `occurredOn`. | Encolar onboarding, bienvenida, provisión. |
| `UserEmailVerifiedEvent` *(planificado)* | Cuando `verifyEmail()` cambie de `false` a `true`. | `userId`, `email`, `verifiedAt`. | Notificar sistemas externos de confianza, habilitar flujos sensibles. |
| `UserPasswordChangedEvent` *(planificado)* | Cuando `changePassword()` recibe un `Password` nuevo. | `userId`, `rotatedAt`. | Revocar sesiones antiguas, invalidar tokens. |

### Business Rules

1. **BR-IA-001 – Email válido y permitido**: Toda cuenta debe usar un `Email` que pase las validaciones de formato y listas de dominios (`Email.ts`). Las pruebas viven en `tests/unit/Email.test.ts`.
2. **BR-IA-002 – Nombre visible obligatorio**: `User.validate()` rechaza nombres vacíos o >255 caracteres. Los errores deben manejarse como excepciones de dominio.
3. **BR-IA-003 – Verificación monotónica**: Una vez verificado, el email no puede regresar a estado no verificado (`User.verifyEmail()` lanza si ya estaba `true`).
4. **BR-IA-004 – Auditoría de credenciales**: Cada rotación de contraseña via `changePassword()` debe recibir un `Password` pre-hasheado, actualizar `updatedAt` y agregar un evento si el proyecto final lo requiere.

### Anti-Glossary

> Términos PROHIBIDOS porque causan confusión

| ❌ No Usar | ✅ Usar En Su Lugar | Por Qué |
|-----------|-------------------|---------|
| "Profile" | "User Account" | "Perfil" se asocia a UI; aquí modelamos identidad persistente. |
| "Pwd" / "Secret" | "Credential" o "Password value object" | Mantener contexto de hashing y políticas. |
| "Flag" | "Verification Status" | Flag no comunica significado de negocio. |
| "Email String" | "Email value object" | Recordatorio de validaciones obligatorias. |

---

## Plantilla base para nuevos bounded contexts

Usa esta plantilla cuando agregues un nuevo contexto. Duplica la sección completa y reemplaza los placeholders antes de tocar código.

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
