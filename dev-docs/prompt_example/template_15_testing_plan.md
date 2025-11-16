# 🧪 PLAN DE PRUEBAS - [Nombre de la Funcionalidad/Proyecto]

**ID del Plan:** TEST-[YYYYMMDD]-[FEATURE_NAME]
**Fecha:** [YYYY-MM-DD]
**Funcionalidad:** [Enlace al ticket o documento de requisitos]
**Responsable(s):** [Equipo de QA/Desarrollo]
**Versión de la Aplicación:** [vX.Y.Z]

---

## 1. Resumen y Estrategia de Pruebas

### Objetivo de las Pruebas
[Describe el objetivo principal. Ej: "Verificar que la nueva funcionalidad de 'Exportación a PDF' cumple con todos los requisitos funcionales, no introduce regresiones y funciona correctamente bajo una carga de trabajo esperada."]

### Alcance de las Pruebas
- **En Alcance (In Scope):** [Listar las funcionalidades y flujos que SÍ se van a probar. Ej: "Generación de PDF", "Envío de PDF por email", "Validación de permisos de exportación".]
- **Fuera de Alcance (Out of Scope):** [Listar lo que NO se va a probar y por qué. Ej: "Pruebas de rendimiento del servidor de email", "Compatibilidad con lectores de PDF de terceros".]

### Entornos de Prueba
- **Local:** Desarrollo individual.
- **Staging/QA:** Entorno de pruebas integrado que replica producción.
- **Producción:** Verificaciones post-despliegue (smoke tests).

### Herramientas y Frameworks
- **Pruebas Unitarias:** [Jest, Vitest]
- **Pruebas de Integración:** [React Testing Library, Supertest]
- **Pruebas E2E:** [Cypress, Playwright]
- **Gestión de Casos de Prueba:** [TestRail, Zephyr, o simplemente este documento]

---

## 2. Estrategia TDD/BDD (Test-Driven/Behavior-Driven Development)

*Esta sección se completa ANTES de escribir el código de la funcionalidad.*

### Comportamiento 1: [Un usuario con permisos puede generar un informe]

- **Given (Dado):** [Un usuario ha iniciado sesión y tiene el rol de 'EDITOR'.]
- **When (Cuando):** [El usuario navega a la página de informes y hace clic en "Exportar a PDF".]
- **Then (Entonces):** [El sistema debe generar un archivo PDF y comenzar su descarga.]
- **And (Y):** [Se debe registrar un evento de auditoría 'informe_generado'.]

### Comportamiento 2: [Un usuario sin permisos no puede generar un informe]

- **Given (Dado):** [Un usuario ha iniciado sesión con el rol de 'LECTOR'.]
- **When (Cuando):** [El usuario navega a la página de informes.]
- **Then (Entonces):** [El botón "Exportar a PDF" no debe estar visible o debe estar deshabilitado.]

---

## 3. Pruebas Unitarias

**Objetivo:** Verificar que cada función, método o componente individual funciona como se espera, de forma aislada.

| Componente/Función a Probar | Condición/Caso de Prueba | Resultado Esperado |
|-----------------------------|--------------------------|--------------------|
| **`calculateTotal(items)`** | `items` es un array vacío | Devuelve `0` |
| | `items` contiene precios positivos | Devuelve la suma correcta |
| | `items` contiene un precio negativo | Lanza un `Error` |
| **`UserPermissionComponent`**| El usuario tiene el rol 'ADMIN' | Renderiza el contenido hijo |
| | El usuario tiene el rol 'LECTOR' | No renderiza nada (o muestra un mensaje de error) |

---

## 4. Pruebas de Integración

**Objetivo:** Verificar que diferentes módulos o servicios colaboran correctamente.

| Escenario de Integración | Componentes Involucrados | Pasos de la Prueba | Resultado Esperado |
|--------------------------|--------------------------|--------------------|--------------------|
| **Guardar formulario de perfil** | `ProfileForm.tsx` (Frontend) y `UserController` (Backend) | 1. Rellenar el formulario en el frontend. 2. Simular el clic en "Guardar". 3. Verificar que la llamada a la API (`/api/user/profile`) se realiza con los datos correctos. 4. Mockear una respuesta exitosa del backend. | El formulario muestra un mensaje de "Éxito". |
| **Obtener datos para el dashboard** | `DashboardService` y `DatabaseRepository` | 1. Llamar al método `getDashboardData()`. 2. Verificar que `DashboardService` llama a los métodos correctos de `DatabaseRepository`. 3. Mockear los datos de la base de datos. | El servicio devuelve los datos en el formato agregado correcto. |

---

## 5. Pruebas End-to-End (E2E)

**Objetivo:** Simular flujos de usuario completos en un entorno lo más parecido a producción posible, desde la UI hasta la base de datos.

### Flujo de Usuario 1: [Registro y Login Exitoso]

- **ID:** E2E-001
- **Prioridad:** Crítica
- **Pasos:**
  1. Navegar a la página `/register`.
  2. Rellenar el formulario con datos válidos.
  3. Hacer clic en "Registrarse".
  4. **Verificación:** Ser redirigido al `/dashboard`.
  5. Hacer clic en "Cerrar Sesión".
  6. Navegar a la página `/login`.
  7. Rellenar el formulario con las credenciales recién creadas.
  8. Hacer clic en "Iniciar Sesión".
  9. **Verificación:** Ser redirigido al `/dashboard` nuevamente.

### Flujo de Usuario 2: [Añadir Producto al Carrito y Checkout]

- **ID:** E2E-002
- **Prioridad:** Alta
- **Pasos:**
  1. Iniciar sesión como cliente.
  2. Navegar a una página de producto.
  3. Hacer clic en "Añadir al Carrito".
  4. **Verificación:** El ícono del carrito se actualiza con "1".
  5. Navegar a la página del carrito.
  6. **Verificación:** El producto añadido es visible con el precio correcto.
  7. Hacer clic en "Proceder al Pago".
  8. **Verificación:** Se muestra la página de checkout.

---

## 6. Criterios de Entrada y Salida

- **Criterios de Entrada (Inicio de Pruebas):**
  - [El código ha sido desplegado en el entorno de Staging/QA.]
  - [Todas las pruebas unitarias y de integración pasan.]
- **Criterios de Salida (Fin de Pruebas / Aprobación):**
  - [El 100% de los casos de prueba críticos y altos han sido ejecutados y pasan.]
  - [No hay bugs bloqueantes o críticos sin resolver.]
  - [La cobertura de código cumple el objetivo del [80]%].
