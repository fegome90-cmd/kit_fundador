# 🏁 PLAN DE PRUEBAS END-TO-END (E2E) - [Nombre de la Aplicación/Funcionalidad]

**ID:** E2E-[YYYYMMDD]-[APP_NAME]
**Fecha:** [YYYY-MM-DD]
**Aplicación:** [Nombre de la aplicación bajo prueba]
**Responsable:** [Equipo de QA/Automatización]

---

## 1. Alcance y Estrategia de las Pruebas E2E

**Objetivo:** Validar flujos de usuario completos y críticos a través de la aplicación en un entorno totalmente integrado, asegurando que todos los componentes (frontend, backend, base de datos, servicios externos) funcionan juntos como se espera desde la perspectiva del usuario final.

**Flujos de Usuario Críticos a Probar:**
- **[Flujo 1]:** [Registro de nuevos usuarios y proceso de onboarding.]
- **[Flujo 2]:** [Búsqueda de un producto, adición al carrito y proceso de checkout completo.]
- **[Flujo 3]:** [Creación, edición y eliminación de un recurso clave (ej: un post, un proyecto).]

**Entorno de Prueba:**
- **URL:** `https://staging.[nombre-app].com`
- **Descripción:** [Un entorno de Staging/QA que es una réplica lo más fiel posible del entorno de producción. Incluye todos los servicios y una base de datos poblada con datos de prueba realistas.]

**Navegadores y Dispositivos:**
- [Chrome (Desktop)]
- [Firefox (Desktop)]
- [Safari (Desktop)]
- [Vista Móvil (emulada en Chrome DevTools)]

---

## 2. Flujos de Usuario Detallados

### Flujo de Prueba 1: [Registro y Onboarding de Nuevo Usuario]

- **ID del Test:** E2E-001
- **Prioridad:** Crítica
- **Descripción:** Este test verifica que un nuevo usuario puede registrarse, recibir un email de bienvenida y completar el primer paso del onboarding.
- **Pasos de Ejecución:**
  1. `cy.visit('/register')`
  2. Rellenar el campo 'email' con un email único generado dinámicamente.
  3. Rellenar los campos 'password' y 'confirmPassword' con una contraseña válida.
  4. Hacer clic en el botón 'Registrarse'.
  5. **Aserción:** La URL debe ser `/welcome/step-1`.
  6. **Aserción:** El título de la página debe contener "¡Bienvenido!".
  7. **(Opcional) Verificación de Email:** Usar una herramienta (ej: `Mailosaur`) para verificar que se ha recibido un email de bienvenida en la dirección de correo registrada.

### Flujo de Prueba 2: [Proceso de Checkout Completo]

- **ID del Test:** E2E-002
- **Prioridad:** Crítica
- **Descripción:** Simula a un usuario que añade un producto al carrito y completa el pago usando datos de tarjeta de crédito de prueba.
- **Pre-condición:** El usuario debe estar logueado (`cy.login()`).
- **Pasos de Ejecución:**
  1. `cy.visit('/products/sample-product')`
  2. Hacer clic en el botón 'Añadir al Carrito'.
  3. `cy.visit('/cart')`
  4. **Aserción:** El carrito debe contener el "sample-product".
  5. Hacer clic en el botón 'Proceder al Pago'.
  6. Rellenar el formulario de dirección.
  7. Rellenar el formulario de pago con datos de tarjeta de prueba.
  8. Hacer clic en 'Confirmar Compra'.
  9. **Aserción:** La URL debe ser `/order-confirmation`.
  10. **Aserción:** La página debe mostrar "¡Gracias por tu compra!".

### Flujo de Prueba 3: [Manejo de Errores en el Login]

- **ID del Test:** E2E-003
- **Prioridad:** Alta
- **Descripción:** Asegura que el sistema muestra mensajes de error claros cuando un usuario intenta iniciar sesión con credenciales incorrectas.
- **Pasos de Ejecución:**
  1. `cy.visit('/login')`
  2. Rellenar el campo 'email' con `invalid@user.com`.
  3. Rellenar el campo 'password' con `wrong-password`.
  4. Hacer clic en el botón 'Iniciar Sesión'.
  5. **Aserción:** Un mensaje de error con el texto "Credenciales inválidas" debe ser visible.
  6. **Aserción:** La URL debe permanecer en `/login`.

---

## 3. Gestión de Datos de Prueba

- **Usuarios de Prueba:** [Se utilizará un conjunto de usuarios predefinidos en la base de datos de staging (ej: `test.admin@app.com`, `test.user@app.com`). Para el registro, se crearán usuarios dinámicamente.]
- **Estado Inicial del Sistema:** [Antes de cada ejecución de la suite de E2E, se ejecutará un script (`npm run db:seed:e2e`) para resetear la base de datos a un estado conocido.]
- **Servicios Externos:** [Las APIs de terceros (ej: Stripe para pagos) estarán en modo de prueba y se usarán claves de API de test.]

---

## 4. Criterios de Aceptación

- [ ] Todos los flujos de prueba críticos y altos se ejecutan y pasan.
- [ ] La suite de E2E se integra en el pipeline de CI/CD y se ejecuta después de cada despliegue a Staging.
- [ ] Los resultados de las pruebas (incluyendo capturas de pantalla y videos en caso de fallo) se archivan y son accesibles para el equipo.
- [ ] No se introducen regresiones en los flujos de usuario existentes.

---
**FIN DEL PLAN DE PRUEBAS E2E**
