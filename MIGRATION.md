# Guía de Migración - Kit Fundador v2.0

## 📋 Cambios Principales

Kit Fundador v2.0 ahora es **agnóstico de lenguaje** y soporta múltiples stacks tecnológicos:

- ✅ TypeScript + Node.js
- ✅ Python + FastAPI
- ✅ Configuración JSON (para otros lenguajes)

## 🔄 Migración desde Versión Anterior

### Si ya tenías un proyecto TypeScript

Tu código actual en `src/` y `tests/` **NO se ve afectado**. Los cambios son:

1. **Estructura nueva**: Los archivos de configuración específicos de TS ahora están en `templates/typescript/`
2. **Script setup.sh**: Se agregó para nuevos proyectos
3. **Documentación mejorada**: Ahora es universal

**No necesitas hacer nada si tu proyecto ya está inicializado.**

### Para Nuevos Proyectos

1. Clona el repositorio
2. Ejecuta `./scripts/setup.sh`
3. Selecciona tu stack preferido
4. El script copiará los archivos correspondientes a la raíz del proyecto

## 📂 Estructura Antes vs Después

### Antes (v1.x)
```
kit-fundador/
├── src/          # TypeScript hardcoded
├── tests/        # Jest hardcoded
├── package.json
├── tsconfig.json
└── ...
```

### Después (v2.0)
```
kit-fundador/
├── templates/
│   ├── typescript/  # Template TypeScript
│   ├── python/      # Template Python
│   └── shared/      # Recursos compartidos
├── dev-docs/        # Documentación universal
├── config/          # Configuración agnóstica
├── scripts/
│   └── setup.sh     # Setup interactivo
└── ...

# Después de ejecutar setup.sh:
├── src/             # Código de tu stack seleccionado
├── tests/           # Tests de tu stack seleccionado
└── [archivos de config según stack]
```

## 🎯 Qué se Mantiene Universal

Estos archivos/carpetas son **independientes del lenguaje**:

- ✅ `.context/` - Gestión de contexto para IA
- ✅ `dev-docs/` - Documentación de arquitectura, DDD, agent-profiles
- ✅ `config/observability/` - Prometheus, SLOs
- ✅ `config/rules/ai-guardrails.json` - Reglas para agentes IA
- ✅ `docker-compose.dev.yml` - Entorno de desarrollo
- ✅ `Makefile` - Comandos make (adaptables)
- ✅ `scripts/validate-architecture.sh` - Validación de arquitectura

## 🔧 Qué es Específico del Lenguaje

Estos archivos ahora están en `templates/[lenguaje]/`:

### TypeScript
- `package.json`, `tsconfig.json`
- `.eslintrc.json`, `.prettierrc`
- `jest.config.js`
- Código en `src/` y `tests/`

### Python
- `pyproject.toml`, `requirements.txt`
- Configuraciones de ruff, mypy, black
- Código en `src/` y `tests/`

## 🚀 Cómo Usar el Nuevo Sistema

### Para Proyectos Nuevos

```bash
# 1. Clonar repositorio
git clone <repo-url> my-project
cd my-project

# 2. Ejecutar setup interactivo
./scripts/setup.sh

# 3. Seleccionar stack
# Opciones: TypeScript, Python, o JSON

# 4. Los archivos se copian automáticamente
```

### Para Proyectos Existentes

Si ya tienes un proyecto con Kit Fundador v1.x:

```bash
# 1. Pull cambios
git pull origin main

# 2. Tu código en src/ y tests/ NO cambia

# 3. (Opcional) Revisar nuevas features:
cat dev-docs/agent-profiles/EJECUTOR.md
cat config/rules/ai-guardrails.json
```

## 📝 Nuevas Features en v2.0

### 1. Sistema Ejecutor/Validador
- `dev-docs/agent-profiles/EJECUTOR.md` (667 líneas)
- `dev-docs/agent-profiles/VALIDADOR.md`
- Workflow de 2 agentes para mejor calidad

### 2. AI Guardrails Mejorados
- 9 antipatrones documentados
- Reglas de código específicas
- Boundaries claros de qué puede/no puede hacer IA

### 3. SLOs Definidos
- `config/observability/slos.yaml`
- Availability: 99.9%
- Latency p95: < 500ms
- Error rate: < 1%

### 4. Templates Multi-Lenguaje
- TypeScript con ejemplos completos
- Python con ejemplos equivalentes
- Opción genérica para otros lenguajes

## ⚙️ Actualizar Proyectos Existentes a v2.0

Si quieres aprovechar las nuevas features:

### Opción 1: Solo Documentación (Recomendado)
```bash
# Copiar nueva documentación sin cambiar código
cp -r <kit-v2>/dev-docs/agent-profiles ./dev-docs/
cp <kit-v2>/config/rules/ai-guardrails.json ./config/rules/
cp <kit-v2>/config/observability/slos.yaml ./config/observability/
```

### Opción 2: Migración Completa
```bash
# 1. Backup tu código
cp -r src src.backup
cp -r tests tests.backup

# 2. Pull Kit v2.0
git remote add kit-fundador <kit-v2-repo>
git pull kit-fundador main

# 3. Restaurar tu código
mv src.backup/* src/
mv tests.backup/* tests/

# 4. Resolver conflictos si existen
```

## 🆘 Problemas Comunes

### "setup.sh no funciona"
```bash
# Asegúrate de que es ejecutable
chmod +x scripts/setup.sh

# Verifica que estás en la raíz del proyecto
pwd  # Debe mostrar /path/to/kit-fundador
```

### "No encuentro mi código después de setup"
- El script `setup.sh` copia archivos de `templates/` a raíz
- Si ya tenías código en `src/`, **no lo ejecutes** en proyectos existentes
- setup.sh es solo para **nuevos proyectos**

### "Quiero cambiar de TypeScript a Python"
```bash
# 1. Backup tu código
mv src src.old

# 2. Ejecutar setup.sh y elegir Python
./scripts/setup.sh

# 3. Migrar manualmente tu lógica de dominio
# (las entidades y value objects deben ser similares)
```

## 📞 Soporte

- **Issues**: GitHub Issues del repositorio
- **Docs**: Revisa `dev-docs/` completo
- **Ejemplos**: Mira `templates/typescript/` y `templates/python/`

## ✅ Checklist de Migración

- [ ] Pull última versión del Kit Fundador v2.0
- [ ] Revisar que `templates/` existe con typescript/, python/
- [ ] Verificar que `scripts/setup.sh` es ejecutable
- [ ] (Si es nuevo proyecto) Ejecutar `./scripts/setup.sh`
- [ ] (Si es proyecto existente) Copiar solo documentación nueva
- [ ] Leer `dev-docs/agent-profiles/EJECUTOR.md`
- [ ] Actualizar `.context/project-state.json` si es necesario
- [ ] Ejecutar `make validate` para verificar arquitectura

---

**¡Bienvenido a Kit Fundador v2.0!** 🎉

Ahora puedes iniciar proyectos en múltiples lenguajes manteniendo los mismos principios de arquitectura, DDD y TDD.
