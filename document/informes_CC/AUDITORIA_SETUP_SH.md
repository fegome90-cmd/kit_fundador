# Auditoría Profunda de setup.sh

- **Versión**: 1.0.0
- **Fecha**: 2025-11-16
- **Archivo auditado**: `scripts/setup.sh`
- **Estado**: ⚠️ CRÍTICO – Requiere correcciones inmediatas

## Executive Summary

El informe detecta un bloqueo total en la opción Python del script de setup, 19 vulnerabilidades moderadas en la plantilla TypeScript y múltiples riesgos de usabilidad/limpieza. Se recomienda suspender el uso de la opción Python hasta corregir las dependencias.

## Hallazgos principales

| ID | Severidad | Resumen |
|----|-----------|---------|
| #1 | 🔴 Crítico | `templates/python/requirements.txt` depende de `opentelemetry-exporter-prometheus>=1.22.0`, versión inexistente, lo que bloquea `pip install` y deja al usuario con un entorno incoherente. |
| #2 | 🟠 Alto | `templates/typescript/package.json` dispara 19 vulnerabilidades moderadas y múltiples paquetes deprecados (`glob@7`, `rimraf@3`, toolchain ESLint 8/@typescript-eslint 6). |
| #3 | 🟡 Medio | El script sobrescribe archivos existentes sin confirmación (`cp -r templates/...`). |
| #4 | 🟡 Medio | Mensajes de éxito engañosos en la ruta Python: aunque `pip install` falla, se imprime "✓ Dependencias instaladas" y "✓ Proyecto Python configurado". |
| #5 | 🔵 Bajo | `cleanup_templates` solo imprime mensajes; no ofrece opción para borrar/mover `templates/`. |
| #6 | 🔵 Bajo | No hay validación previa de prerequisitos (npm, python3, git). |
| #7 | 🔵 Bajo | No existe suite automatizada que pruebe `scripts/setup.sh`. |
| #8 | 🔵 Bajo | `update_context` depende de `date -u` y valores embebidos sin control de compatibilidad. |
| #9 | 🔵 Bajo | El Makefile asume `docker-compose.dev.yml` siempre presente.

## Plan sugerido por la auditoría

1. **Fase 1 – Correcciones críticas (≈3h)**
   - Actualizar `requirements.txt` para usar versiones reales (`opentelemetry-exporter-prometheus>=0.47b0`, `redis>=5`, etc.).
   - Elevar dependencias del template TS (eslint 9, @typescript-eslint 8, redis 5) y eliminar vulnerabilidades.
2. **Fase 2 – Usabilidad (≈2h)**
   - Añadir confirmación o bandera `--force` antes de sobrescribir archivos.
   - Hacer que `pip install` pare el script al fallar y reporte errores claros.
3. **Fase 3 – Hardening (≈5h)**
   - Tests automatizados para `setup.sh`, validación de prerequisitos, limpieza opcional de templates y verificación de Docker Compose.

## Métricas objetivo (post-fix)

- Éxito de setup en las 3 opciones: 100%.
- `npm audit`: 0 vulnerabilidades.
- Cobertura de tests del script: ≥80%.
- Mensajería verídica (sin falsos positivos).

> Documento fuente original emitido por Claude Code (Anthropic) el 16-nov-2025.
