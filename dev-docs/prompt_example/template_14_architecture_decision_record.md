# ADR-[Número]: [Título de la Decisión de Arquitectura]

**Fecha:** [YYYY-MM-DD]
**Status:** [Propuesto / Aceptado / Rechazado / Deprecado]

## 1. Contexto (Context)

[Esta sección describe el problema, las fuerzas en juego y el contexto que impulsa la necesidad de tomar una decisión. Debe ser concisa pero completa. Ejemplos:
- "El sistema de notificaciones actual, basado en polling cada 5 segundos, está causando una carga excesiva en la base de datos y no escala con el aumento de usuarios."
- "Necesitamos implementar un sistema de autenticación, pero no hay un estándar definido en la compañía. Las opciones son construir uno propio, usar un servicio de terceros (SaaS) como Auth0, o integrar una librería open-source como Keycloak."]

## 2. Decisión (Decision)

[Esta es la declaración de la decisión que se ha tomado. Debe ser clara, directa y sin ambigüedades. Ejemplos:
- "Implementaremos WebSockets utilizando la librería `socket.io` para notificaciones en tiempo real, reemplazando el sistema de polling actual."
- "Adoptaremos Auth0 como nuestro proveedor de identidad (IdP) para manejar la autenticación y autorización de todos los nuevos servicios."]

## 3. Justificación (Rationale)

[Esta sección es crucial. Explica *por qué* se tomó esta decisión. Debe detallar los pros de la opción elegida y por qué superan a los contras y a las otras alternativas. Ejemplos:
- "La adopción de WebSockets reduce la carga de la base de datos en un 90% y proporciona una experiencia de usuario instantánea. Aunque introduce un estado persistente en el servidor, los beneficios de rendimiento y UX superan esta complejidad. `socket.io` fue elegido por su robusto sistema de fallback y su amplia comunidad."]
- "Auth0 nos permite externalizar la complejidad de la seguridad, acelera nuestro tiempo de desarrollo y nos proporciona funcionalidades avanzadas como MFA y SSO de inmediato. Aunque introduce un costo y una dependencia de un tercero, el costo de construir y mantener un sistema propio equivalente sería significativamente mayor y más riesgoso."]

## 4. Consecuencias (Consequences)

[Toda decisión tiene consecuencias, tanto positivas como negativas. Esta sección debe listarlas de manera honesta para que el equipo entienda el impacto completo del cambio.]

### Positivas:
- **[Consecuencia Positiva 1]:** [ej: "Reducción significativa de la latencia para el usuario final."]
- **[Consecuencia Positiva 2]:** [ej: "El equipo de desarrollo no necesitará ser experto en protocolos de autenticación."]
- **[Consecuencia Positiva 3]:** [ej: "Se establece un patrón claro para futuros servicios."]

### Negativas:
- **[Consecuencia Negativa 1]:** [ej: "Se introduce un nuevo costo operativo mensual de $XXX."]
- **[Consecuencia Negativa 2]:** [ej: "Añade una nueva tecnología (`WebSockets`) al stack que el equipo necesita aprender."]
- **[Consecuencia Negativa 3]:** [ej: "Se crea una dependencia fuerte con un proveedor externo. Se necesita un plan de mitigación si el proveedor falla."]

## 5. Alternativas Consideradas (Alternatives)

[Esta sección demuestra que la decisión fue bien pensada. Lista las otras opciones que se consideraron y por qué fueron rechazadas.]

### [Alternativa 1: ej: "Usar Server-Sent Events (SSE)"]
- **Pros:** [ej: "Más simple que WebSockets, basado en HTTP."]
- **Contras:** [ej: "Es unidireccional (servidor a cliente), lo que no cumple con nuestro requisito futuro de comunicación bidireccional."]
- **Razón del Rechazo:** [No cumple con todos los requisitos a largo plazo.]

### [Alternativa 2: ej: "Construir nuestro propio sistema de autenticación"]
- **Pros:** [ej: "Control total sobre la funcionalidad y los datos."]
- **Contras:** [ej: "Extremadamente complejo y arriesgado. Requiere una profunda experiencia en seguridad. Alto costo de desarrollo y mantenimiento."]
- **Razón del Rechazo:** [El riesgo y el costo superan ampliamente los beneficios.]

### [Alternativa 3: ej: "Integrar Keycloak (Open Source)"]
- **Pros:** [ej: "Sin costo de licencia, auto-hospedado para mayor control."]
- **Contras:** [ej: "Requiere que gestionemos y escalemos la infraestructura nosotros mismos, lo que añade una carga operativa significativa."]
- **Razón del Rechazo:** [El equipo de DevOps no tiene la capacidad actual para mantener un servicio de identidad crítico.]

## 6. Referencias (Opcional)

- [Enlace a un prototipo (PoC)]
- [Enlace a la documentación de la tecnología elegida]
- [Enlace a un artículo o benchmark que apoye la decisión]
