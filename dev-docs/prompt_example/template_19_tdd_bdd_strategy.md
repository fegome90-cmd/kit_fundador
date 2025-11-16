# 🧩 ESTRATEGIA TDD/BDD - [Nombre de la Funcionalidad]

**ID:** TDD-[YYYYMMDD]-[FEATURE_NAME]
**Fecha:** [YYYY-MM-DD]
**Funcionalidad:** [Enlace al ticket o documento de requisitos]
**Autor(es):** [Equipo de Desarrollo/QA]

---

## 1. Resumen de la Funcionalidad

[Describe brevemente la funcionalidad o historia de usuario. ¿Cuál es el objetivo desde la perspectiva del usuario? Ej: "Como usuario registrado, quiero poder añadir múltiples artículos a mi carrito de compras para poder comprarlos todos en una sola transacción."]

## 2. Escenarios de Comportamiento (Behavior Scenarios)

*Esta sección define los tests de aceptación. Cada escenario debe ser escrito antes de la implementación para guiar el desarrollo.*

### Escenario 1: [Título descriptivo del escenario, ej: "Añadir un artículo al carrito por primera vez"]

- **Feature:** Carrito de Compras
- **Scenario:** Un usuario añade el primer artículo a un carrito vacío.

- **Given (Dado):** Un usuario está autenticado en el sistema.
- **And (Y):** El carrito de compras del usuario está vacío.
- **When (Cuando):** El usuario visita la página del producto "X" y hace clic en "Añadir al Carrito".
- **Then (Entonces):** El carrito de compras debe contener 1 unidad del producto "X".
- **And (Y):** El subtotal del carrito debe ser igual al precio del producto "X".

### Escenario 2: [ej: "Añadir un artículo existente al carrito"]

- **Feature:** Carrito de Compras
- **Scenario:** Un usuario añade una segunda unidad de un artículo que ya está en el carrito.

- **Given (Dado):** Un usuario está autenticado y su carrito de compras contiene 1 unidad del producto "X".
- **When (Cuando):** El usuario visita nuevamente la página del producto "X" y hace clic en "Añadir al Carrito".
- **Then (Entonces):** El carrito de compras debe contener 2 unidades del producto "X".
- **And (Y):** El subtotal del carrito debe ser el doble del precio del producto "X".

### Escenario 3: [ej: "Validación de stock al añadir al carrito"]

- **Feature:** Carrito de Compras
- **Scenario:** Un usuario intenta añadir un artículo sin stock suficiente.

- **Given (Dado):** Un usuario está autenticado y el producto "Y" tiene un stock de 0.
- **When (Cuando):** El usuario visita la página del producto "Y" y hace clic en "Añadir al Carrito".
- **Then (Entonces):** El sistema debe mostrar un mensaje de error "No hay stock disponible".
- **And (Y):** El carrito de compras del usuario debe permanecer vacío.

### Escenario 4: [ej: "Añadir un artículo de un tipo diferente"]

- **Feature:** Carrito de Compras
- **Scenario:** Un usuario añade un producto diferente a un carrito que ya tiene artículos.

- **Given (Dado):** Un usuario está autenticado y su carrito de compras contiene 1 unidad del producto "X".
- **When (Cuando):** El usuario visita la página del producto "Z" y hace clic en "Añadir al Carrito".
- **Then (Entonces):** El carrito de compras debe contener 1 unidad del producto "X" Y 1 unidad del producto "Z".
- **And (Y):** El subtotal del carrito debe ser la suma de los precios de "X" y "Z".

---

## 3. Plan de Implementación Guiado por Pruebas

**Objetivo:** Implementar la funcionalidad pasando un escenario a la vez.

1.  **Implementar Test para Escenario 1:**
    - Escribir un test de aceptación (E2E o integración) que falle y que replique los pasos del Escenario 1.
2.  **Escribir Código para Pasar el Test 1:**
    - Implementar la lógica mínima necesaria en el backend y frontend para que el test del Escenario 1 pase.
3.  **Refactorizar:**
    - Limpiar el código escrito mientras se asegura que el test siga pasando.
4.  **Repetir para Escenario 2:**
    - Escribir un nuevo test que falle para el Escenario 2.
    - Modificar el código para que tanto el test 1 como el 2 pasen.
    - Refactorizar.
5.  **...continuar para todos los escenarios.**

---
**FIN DE LA ESTRATEGIA TDD/BDD**
