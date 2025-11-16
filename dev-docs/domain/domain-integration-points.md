# Domain Integration Points

El dominio del starkit es deliberadamente minimalista: sólo ilustra patrones de DDD sin atar dependencias reales. Usa esta guía
para saber dónde conectar tus propios servicios.

## Value Objects

### Email
- **Constantes reutilizables**: `EMAIL_REGEX`, `MAX_EMAIL_LENGTH` y `BLOCKED_DOMAINS` viven fuera de la clase para que puedas
  reemplazarlos desde un único lugar.
- **Cómo extender**: si necesitas reglas regionales (p. ej. dominios corporativos), modifica estas constantes o delega en un
  servicio de validación en la capa de aplicación.

### Password
- **Placeholder seguro**: `HASH_PLACEHOLDER_PREFIX` y `MIN_PASSWORD_LENGTH` sólo sirven para ilustrar restricciones.
- **Integración real**: crea una interfaz `PasswordHasher` en la capa de aplicación/infrastructure y pásale el hash resultante al
  value object (`Password.fromHash`).

## Entidades y eventos

### User aggregate
- **Eventos acumulados**: `getDomainEvents()` expone una copia inmutable lista para enviar al bus que definas.
- **Dispatcher**: implementa `DomainEventDispatcher.publish()` en tu infraestructura (Kafka, SNS, Webhooks, etc.) y ejecútalo en
  el application service inmediatamente después de guardar el agregado.
- **Invariantes adicionales**: las operaciones `verifyEmail` y `changePassword` son ejemplos. Añade tus propios métodos para
  cubrir reglas reales (concurrency, versioning, etc.).

### Patrón recomendado

```typescript
const user = User.create({...});
await userRepository.save(user);
await domainEventDispatcher.publish(user.getDomainEvents());
user.clearDomainEvents();
```

1. **Persistencia primero** para evitar publicar eventos que después fallen al guardar.
2. **Dispatcher desacoplado** usando la interfaz del dominio.
3. **clearDomainEvents()** mantiene el agregado limpio para siguientes operaciones.

## Checklist de implementación

- [ ] Define un `PasswordHasher` real y úsalo antes de llamar a `Password.fromHash`.
- [ ] Decide si tus eventos viajarán por outbox, cola o webhooks.
- [ ] Implementa `DomainEventDispatcher` en la capa de infraestructura.
- [ ] Asegura que cada método del aggregate documente cuándo se emite un evento.
- [ ] Actualiza `dev-docs/domain/invariants.md` con las nuevas reglas.
