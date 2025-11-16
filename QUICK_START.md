# Guía de Inicio Rápido

## Primeros Pasos

### 1. Configurar Tech Stack
```bash
nano config/tech-stack.json
```
Editar según el lenguaje y framework elegido.

### 2. Completar Contexto
```bash
nano dev-docs/context.md
```
Describir:
- Propósito del proyecto
- Dominio de negocio
- Alcance (qué SI y qué NO)

### 3. Definir Ubiquitous Language
```bash
nano dev-docs/domain/ubiquitous-language.md
```
Documentar términos clave del dominio.

### 4. Crear Primera Task
```bash
nano dev-docs/task.md
```
Agregar primera tarea técnica.

### 5. Levantar Entorno
```bash
make dev
```
O manualmente:
```bash
docker-compose -f docker-compose.dev.yml up
```

### 6. Verificar Servicios
```bash
make health
```

## Workflow de Desarrollo

### Para el Agente IA

1. **Antes de codificar**:
   - Leer `config/rules/ai-guardrails.json`
   - Leer `.context/project-state.json`
   - Elegir task de `dev-docs/task.md`

2. **Durante desarrollo**:
   - Seguir TDD: Red → Green → Refactor
   - Actualizar tests
   - Ejecutar linting/formatting

3. **Después de codificar**:
   - Actualizar `.context/active-context.md`
   - Marcar task como completada
   - Actualizar `project-state.json`

### Para Humanos

1. Elegir task de `dev-docs/task.md`
2. Crear branch: `git checkout -b feature/TASK-XXX`
3. Seguir TDD
4. Commit frecuente
5. Push y crear PR
6. Code review
7. Merge a develop

## Comandos Útiles

```bash
# Desarrollo
make dev              # Iniciar
make logs             # Ver logs
make shell            # Shell en container

# Testing
make test             # Todos los tests
make test-watch       # Watch mode
make test-coverage    # Con coverage

# Database
make migrate          # Migraciones
make seed             # Datos de prueba
make db-shell         # PostgreSQL CLI

# Quality
make lint             # Linter
make format           # Formatter
make validate         # Arquitectura

# Cleanup
make clean            # Limpiar
make reset            # Reset completo
```

## Próximos Pasos

1. Implementar primera entidad de dominio
2. Crear tests unitarios
3. Implementar repository
4. Crear use case
5. Exponer vía API REST

## Ayuda

- Documentación completa: [README.md](../README.md)
- Reglas del agente: [config/rules/ai-guardrails.json](../config/rules/ai-guardrails.json)
- Arquitectura: [dev-docs/context.md](../dev-docs/context.md)
