# 🔗 PLAN DE PRUEBAS DE INTEGRACIÓN - [Funcionalidad/Flujo]

**ID:** INT-[YYYYMMDD]-[FEATURE_NAME]
**Fecha:** [YYYY-DD-MM]
**Funcionalidad:** [Nombre de la funcionalidad que requiere la integración]
**Responsable:** [Equipo de Desarrollo/QA]

---

## 1. Alcance de las Pruebas de Integración

**Objetivo:** Verificar que diferentes módulos, servicios o capas de la aplicación se comunican y colaboran correctamente para completar una tarea. Estas pruebas se enfocan en las "costuras" (seams) del sistema.

**Puntos de Integración a Probar:**
- **[Integración 1]:** [Comunicación entre el componente de UI `X` y el servicio de API `Y`.]
- **[Integración 2]:** [Interacción entre el `Servicio A` y el `Servicio B` a través de mensajes de RabbitMQ.]
- **[Integración 3]:** [Escritura y lectura de datos desde el `Servicio C` a la base de datos PostgreSQL.]

**Componentes Mockeados vs. Reales:**
- **Reales:** [Para probar la integración `1`, el componente de UI y el servidor de API se ejecutarán realmente.]
- **Mockeados:** [La base de datos será una versión en memoria (in-memory) o un contenedor de Docker de prueba. Las APIs de terceros (ej: Stripe) serán mockeadas.]

---

## 2. Escenarios de Prueba de Integración

### Escenario 1: [ej: Creación de un nuevo usuario (UI → API → Base de Datos)]

- **ID del Escenario:** INT-001
- **Punto de Integración:** Frontend con Backend API.
- **Flujo:**
  1. **Setup:** Iniciar el servidor de la API con una base de datos de prueba vacía.
  2. **Acción (UI):** Renderizar el formulario de registro en un entorno de prueba (ej: `jsdom`) y simular el envío con datos de usuario válidos.
  3. **Verificación (API):** Asegurar que el endpoint `POST /api/users` recibe una petición con los datos correctos.
  4. **Verificación (Base de Datos):** Conectarse a la base de datos de prueba y verificar que se ha creado un nuevo registro en la tabla `users` con la información enviada.

### Escenario 2: [ej: Procesamiento de un pedido (Servicio A → Message Queue → Servicio B)]

- **ID del Escenario:** INT-002
- **Punto de Integración:** Microservicios asíncronos.
- **Flujo:**
  1. **Setup:** Iniciar los servicios `Pedidos` y `Notificaciones`, y un broker de RabbitMQ de prueba.
  2. **Acción (Servicio A):** Realizar una llamada directa a la API del servicio `Pedidos` para crear un nuevo pedido.
  3. **Verificación (Message Queue):** Comprobar que el servicio `Pedidos` ha publicado un mensaje `pedido_creado` en la cola correcta de RabbitMQ.
  4. **Verificación (Servicio B):** Asegurar que el servicio `Notificaciones` consume el mensaje y (usando un mock) intenta enviar un email de confirmación.

### Escenario 3: [ej: Fallo de comunicación entre API y Base de Datos]

- **ID del Escenario:** INT-003
- **Punto de Integración:** Capa de servicio con capa de datos.
- **Flujo:**
  1. **Setup:** Iniciar el servidor de la API, pero detener o hacer inaccesible la base de datos de prueba.
  2. **Acción (API):** Realizar una petición al endpoint `GET /api/products`.
  3. **Verificación (API):** Asegurar que el endpoint responde con un código de estado `500 Internal Server Error` y un mensaje de error apropiado, en lugar de crashear.

---

## 3. Datos de Prueba

- **Usuario de Prueba:** `{ "nombre": "Test User", "email": "test@example.com" }`
- **Estado Inicial de la BD:** [Script SQL o fixture para poblar la base de datos con datos conocidos antes de cada prueba.]
- **Payloads de API:** [Ejemplos de JSON que se enviarán y recibirán.]

---

## 4. Criterios de Aceptación

- [ ] Todos los escenarios de integración definidos pasan.
- [ ] Los contratos entre servicios (ej: esquemas de mensajes, especificaciones OpenAPI) se respetan.
- [ ] El manejo de errores en los límites de los componentes es robusto.
- [ ] Las pruebas de integración se ejecutan exitosamente en el pipeline de CI/CD.

---
**FIN DEL PLAN DE PRUEBAS DE INTEGRACIÓN**
