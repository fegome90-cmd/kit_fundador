# Post-clone Checklist del Consumidor

Este starkit entrega un cascarón mínimamente opinado. Cada equipo que lo adopta debe **terminar de cablear sus servicios** para que el código sea ejecutable. Usa esta lista como guía inmediata tras clonar el repositorio.

## 1. Entry points y scripts
- [ ] Crear el entrypoint real del proyecto (por ejemplo, `src/index.ts`, `main.py` o similar) y actualizar los scripts de `package.json`/`Makefile` para apuntar a ese archivo.
- [ ] Revisar los comandos de `make`, `npm` o el runner elegido y remplazar los placeholders (`<project-entrypoint>`, `<your-test-command>`, etc.).
- [ ] Definir cómo se ejecutarán los tests en el stack seleccionado (Jest, Pytest, Go test, etc.) y actualizar `lint-staged` u otros hooks.

## 2. Dependencias y servicios implícitos
- [ ] Importar explícitamente módulos estándar que no están disponibles globalmente (ej. `import crypto from 'node:crypto'`).
- [ ] Implementar o inyectar un servicio de hashing real en `Password` en lugar del `hashed_${plainPassword}` ilustrativo.
- [ ] Definir cómo se almacenarán y despacharán los `DomainEvent` (bus, cola, webhook, etc.).
- [ ] Revisar la política de email/password para ajustarla a los requisitos del dominio real.

## 3. Seguridad y configuración
- [ ] Añadir gestión de secretos (dotenv, vault, AWS SM, etc.).
- [ ] Configurar los linters/formatters apropiados (ESLint, Ruff, Prettier, Black…).
- [ ] Activar escáneres de dependencias o tools de seguridad que use tu organización.

## 4. Documentación viva
- [ ] Completar `dev-docs/context.md` con el dominio real.
- [ ] Registrar tus propios bounded contexts/agregados en `dev-docs/plan.md` y `dev-docs/domain/`.
- [ ] Actualizar `dev-docs/task.md` moviendo las tareas tomadas a "En Progreso" y marcando los criterios completados.

> 📝 **Importante**: Las clases `User`, `Password`, `Email` y los tests asociados son ejemplos educativos. No están listos para producción y se espera que el consumidor los extienda o reemplace antes de exponerlos en un entorno real.
