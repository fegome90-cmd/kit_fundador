# 🛡️ AUDITORÍA DE SEGURIDAD - [Nombre del Aplicativo/Módulo]

**Auditoría ID:** AUDIT-SEC-[YYYYMMDD]-[APP_NAME]
**Fecha:** [YYYY-MM-DD]
**Scope:** [Componentes auditados, ej: API Backend, Proceso de Autenticación]
**Auditor:** [Nombre del Auditor/Equipo de Seguridad]
**Metodología:** Basado en OWASP Top 10, Análisis de Dependencias, y Revisión de Configuración.

---

## 📊 Resumen Ejecutivo

### **Score de Riesgo Global: [BAJO/MEDIO/ALTO/CRÍTICO]**

| Dominio de Auditoría | Vulnerabilidades Críticas | Vulnerabilidades Altas | Vulnerabilidades Medias | Status |
|----------------------|--------------------------|------------------------|-------------------------|--------|
| **Dependencias** | [Nº] | [Nº] | [Nº] | [✅/⚠️/❌] |
| **Código Fuente (SAST)**| [Nº] | [Nº] | [Nº] | [✅/⚠️/❌] |
| **Autenticación/Autorización**| [Nº] | [Nº] | [Nº] | [✅/⚠️/❌] |
| **Manejo de Secretos**| [Nº] | [Nº] | [Nº] | [✅/⚠️/❌] |
| **Configuración Infra/Red**| [Nº] | [Nº] | [Nº] | [✅/⚠️/❌] |
| **TOTAL** | **[Nº]** | **[Nº]** | **[Nº]** | [✅/⚠️/❌] |

### **Veredicto: ✅ PASA / ⚠️ PASA CON CONDICIONES / ❌ NO PASA**

**Justificación:** [Resumen de los hallazgos más críticos. Ej: "Se encontraron X vulnerabilidades críticas en dependencias de producción que deben ser parchadas inmediatamente. El sistema de autorización presenta fallos que permiten la escalada de privilegios."]

---

## 1️⃣ Análisis de Vulnerabilidades en Dependencias

**Herramienta(s) Utilizada(s):** [ej: `npm audit`, `Snyk`, `Dependabot`]
**Fecha del Análisis:** [YYYY-MM-DD]

### Resumen de Vulnerabilidades
- **Críticas:** [Nº]
- **Altas:** [Nº]
- **Medias:** [Nº]
- **Bajas:** [Nº]

### Vulnerabilidades Críticas/Altas Identificadas

| ID de Vulnerabilidad | Paquete Afectado | Versión | Severidad | Resumen del Riesgo | Plan de Remediación |
|----------------------|------------------|---------|-----------|--------------------|---------------------|
| [CVE-XXXX-XXXX] | `[nombre-paquete]` | `[versión]`| Crítica | [ej: "Permite ejecución remota de código (RCE)"] | [ej: "Actualizar a la versión X.Y.Z"] |
| [SNYK-JS-XXXX] | `[nombre-paquete]` | `[versión]`| Alta | [ej: "Vulnerable a Cross-Site Scripting (XSS)"] | [ej: "Aplicar parche y actualizar a X.Y.Z"] |

---

## 2️⃣ Revisión de Código Fuente (Análisis Estático - SAST)

**Herramienta(s) Utilizada(s):** [ej: `SonarQube`, `CodeQL`, Revisión Manual]
**Reglas Aplicadas:** [ej: OWASP Top 10 2021, CWE Top 25]

### Hallazgos Principales (OWASP Top 10)

| Categoría OWASP | Hallazgo | Ubicación (Archivo:Línea) | Severidad | Descripción y Recomendación |
|-----------------|----------|---------------------------|-----------|-----------------------------|
| **A01: Broken Access Control** | [ej: "IDOR en endpoint de usuario"] | `[UserController.ts:45]` | Alta | [ej: "El endpoint GET /api/users/:id no valida que el usuario autenticado sea el dueño del recurso. Se debe añadir una validación de propiedad."] |
| **A02: Cryptographic Failures** | [ej: "Uso de algoritmo de hash débil"] | `[AuthService.ts:120]` | Media | [ej: "Se está usando MD5 para hashear contraseñas. Se debe migrar a un algoritmo robusto como Argon2 o bcrypt."] |
| **A03: Injection** | [ej: "SQL Injection en búsqueda"] | `[SearchRepository.ts:88]` | Crítica | [ej: "La query a la base de datos concatena directamente el input del usuario. Se deben usar consultas parametrizadas (prepared statements)."] |

---

## 3️⃣ Auditoría de Autenticación y Autorización

### Checklist de Autenticación
- [ ] **Manejo de Contraseñas:** ¿Se usan algoritmos de hashing fuertes (Argon2, bcrypt)? [✅/❌]
- [ ] **Políticas de Contraseña:** ¿Se exigen contraseñas complejas? [✅/❌]
- [ ] **Manejo de Sesiones:** ¿Los IDs de sesión son seguros y se invalidan al cerrar sesión? [✅/❌]
- [ ] **Protección contra Fuerza Bruta:** ¿Existe rate limiting en el login? [✅/⚠️/❌]

### Checklist de Autorización
- [ ] **Principio de Mínimo Privilegio:** ¿Los usuarios tienen solo los permisos que necesitan? [✅/❌]
- [ ] **Validación de Acceso a Nivel de API:** ¿Cada endpoint valida los permisos del usuario? [✅/❌]
- [ ] **Prevención de Escalada de Privilegios:** ¿Un usuario no puede auto-asignarse roles superiores? [✅/❌]
- [ ] **Control de Acceso Inseguro Directo a Objetos (IDOR):** ¿Se valida la propiedad de los recursos? [✅/⚠️/❌]

---

## 4️⃣ Manejo de Secretos y Claves de API

### Checklist de Gestión de Secretos
- [ ] **No Secretos en el Código:** ¿No hay claves, contraseñas o tokens hardcodeados en el código fuente? [✅/❌]
- [ ] **Almacenamiento Seguro:** ¿Se utiliza un gestor de secretos (ej: HashiCorp Vault, AWS Secrets Manager)? [✅/⚠️/❌]
- [ ] **Rotación de Secretos:** ¿Existe un procedimiento para rotar las claves periódicamente? [✅/❌]
- [ ] **Auditoría de Acceso:** ¿Se registran los accesos a los secretos? [✅/❌]

---

## 5️⃣ Configuración de Infraestructura y Red

### Checklist de Configuración
- [ ] **Headers de Seguridad:** ¿Se usan headers como `Content-Security-Policy`, `Strict-Transport-Security` (HSTS)? [✅/⚠️/❌]
- [ ] **Configuración de CORS:** ¿La política de Cross-Origin Resource Sharing es restrictiva y no usa `*`? [✅/❌]
- [ ] **Exposición de Puertos/Servicios:** ¿Solo los puertos necesarios están expuestos públicamente? [✅/❌]
- [ ] **Logging y Monitoreo de Seguridad:** ¿Se registran eventos de seguridad (ej: logins fallidos) y se generan alertas? [✅/⚠️/❌]

---

## 🚀 Plan de Remediación

### Acciones Críticas/Altas (Requieren Atención Inmediata)

| ID | Hallazgo | Acción Recomendada | Responsable | Plazo |
|----|----------|--------------------|-------------|-------|
| 1 | [Vulnerabilidad de Inyección SQL] | [Implementar consultas parametrizadas en `SearchRepository.ts`] | [Equipo Backend] | [24 horas] |
| 2 | [Fallo de Control de Acceso (IDOR)] | [Añadir validación de propiedad en `UserController.ts`] | [Equipo Backend] | [48 horas] |
| 3 | [Dependencia Crítica con RCE] | [Actualizar el paquete `X` a la versión `Y`] | [Equipo DevOps] | [24 horas] |

### Acciones a Mediano Plazo

| ID | Hallazgo | Acción Recomendada | Responsable | Plazo |
|----|----------|--------------------|-------------|-------|
| 4 | [Uso de algoritmo de hash débil] | [Planificar migración de hashes de contraseñas a Argon2] | [Equipo Backend] | [Próximo Sprint] |
| 5 | [Falta de headers de seguridad] | [Implementar CSP y HSTS en la configuración del servidor web] | [Equipo Frontend/DevOps] | [Próximo Sprint] |

---
**FIN DE LA AUDITORÍA**
