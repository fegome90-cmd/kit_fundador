#!/bin/bash
# Kit Fundador v2.0 - Setup Script
# Inicializa el proyecto con el stack tecnológico seleccionado

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

load_dotenv() {
    local dotenv_file=".env"

    if [[ ! -f $dotenv_file ]]; then
        echo -e "${YELLOW}⚠ No se encontró .env. Copia .env.example si deseas que el setup use tus credenciales locales.${NC}"
        return 0
    fi

    set -a
    # shellcheck disable=SC1090
    source "$dotenv_file"
    set +a
    echo -e "${BLUE}ℹ️ Variables de .env cargadas en el entorno actual.${NC}"
}

SKIP_INSTALLS=${SETUP_SH_SKIP_INSTALLS:-false}

FORCE_MODE=false

# usage muestra la ayuda de uso del script setup.sh con las opciones disponibles y las variables de entorno relevantes.
usage() {
    cat <<USAGE
Uso: ./scripts/setup.sh [opciones]

Opciones:
  --force       Omite confirmaciones de sobrescritura y validaciones de prerequisitos.
  -h, --help    Muestra esta ayuda y termina.

Variables de entorno:
  SETUP_SH_SKIP_INSTALLS=true  Omite `npm install`/`pip install` (útil en CI o en el harness de tests).
USAGE
}

# parse_args parses supported command-line flags.
# parse_args parses CLI flags and configures runtime options: `--force` sets FORCE_MODE=true, `-h`/`--help` prints usage and exits 0, and any unknown flag prints an error and exits with status 1.
parse_args() {
    while [[ $# -gt 0 ]]; do
        case "$1" in
            --force)
                FORCE_MODE=true
                shift
                ;;
            -h|--help)
                usage
                exit 0
                ;;
            *)
                echo -e "${RED}Flag no reconocida: $1${NC}"
                usage
                exit 1
                ;;
        esac
    done
}

parse_args "$@"
load_dotenv

# utc_timestamp returns the current UTC timestamp in ISO 8601 `YYYY-MM-DDTHH:MM:SSZ` format, falling back to Python if `date` is unavailable and to `1970-01-01T00:00:00Z` if neither is available.
utc_timestamp() {
    if command -v date &> /dev/null; then
        if ts=$(date -u +"%Y-%m-%dT%H:%M:%SZ" 2> /dev/null); then
            echo "$ts"
            return 0
        fi
    fi

    if command -v python3 &> /dev/null; then
        python3 - <<'PY'
import datetime
print(datetime.datetime.utcnow().replace(microsecond=0).isoformat() + "Z")
PY
        return 0
    fi

    echo "1970-01-01T00:00:00Z"
}

# has_compose checks whether `docker-compose` is available either as a standalone command or as the Docker CLI `compose` subcommand.

has_compose() {
    if command -v docker-compose &> /dev/null; then
        return 0
    fi

    if command -v docker &> /dev/null; then
        if docker compose version &> /dev/null; then
            return 0
        fi
    fi

    return 1
}

# validate_prerequisites checks that required CLI tools for the given mode ('typescript', 'python', or 'generic') are installed, prints any missing tools, and exits with status 1 unless FORCE_MODE is true.
validate_prerequisites() {
    local mode=$1
    local -a missing

    if ! command -v git &> /dev/null; then
        missing+=("git")
    fi

    case $mode in
        typescript)
            if ! command -v npm &> /dev/null; then
                missing+=("npm")
            fi
            if ! has_compose; then
                missing+=("docker-compose")
            fi
            ;;
        python)
            local has_python=false
            local has_pip=false

            if command -v python3 &> /dev/null; then
                has_python=true
            fi

            if command -v pip &> /dev/null; then
                has_pip=true
            elif [[ $has_python == true ]] && python3 -m pip --version &> /dev/null; then
                has_pip=true
            fi

            if [[ $has_python == false ]]; then
                missing+=("python3")
            fi

            if [[ $has_pip == false ]]; then
                missing+=("pip")
            fi

            if ! has_compose; then
                missing+=("docker-compose")
            fi
            ;;
        generic)
            # No prerequisitos adicionales
            ;;
    esac

    if [[ ${#missing[@]} -gt 0 ]]; then
        echo -e "${RED}❌ Prerequisitos faltantes para la opción $mode:${NC}"
        for bin in "${missing[@]}"; do
            echo "  - $bin"
        done

        if [[ "$FORCE_MODE" == true ]]; then
            echo -e "${YELLOW}⚠ Ejecutando con --force: continúa bajo tu propio riesgo.${NC}"
        else
            echo -e "${YELLOW}Instala las herramientas indicadas o ejecuta con --force si realmente deseas continuar.${NC}"
            exit 1
        fi
    fi
}

# confirm_overwrite checks for files that would be overwritten by the selected mode, lists any existing targets, and either returns, prompts the user to confirm overwriting (exiting on decline), or skips the prompt when FORCE_MODE is true.
confirm_overwrite() {
    local mode=$1
    local -a targets=("src" "tests" "config/tech-stack.json" ".context/project-state.json")

    case $mode in
        typescript)
            targets+=("package.json" "tsconfig.json" "jest.config.js" ".eslintrc.json" ".prettierrc")
            ;;
        python)
            targets+=("pyproject.toml" "requirements.txt" "venv")
            ;;
        generic)
            targets+=("src/domain/entities/.gitkeep" "src/domain/value_objects/.gitkeep")
            ;;
    esac

    local -a existing
    for path in "${targets[@]}"; do
        if [[ -e $path ]]; then
            existing+=("$path")
        fi
    done

    if [[ ${#existing[@]} -eq 0 ]]; then
        return
    fi

    echo -e "${YELLOW}⚠ Se encontraron archivos existentes que serían sobrescritos:${NC}"
    for path in "${existing[@]}"; do
        echo "  - $path"
    done

    if [[ "$FORCE_MODE" == true ]]; then
        echo -e "${YELLOW}--force activado → sobrescribiendo sin confirmación adicional.${NC}"
        return
    fi

    read -r -p "¿Deseas continuar y sobrescribir estos archivos? (y/N): " confirm
    if [[ ! $confirm =~ ^[Yy]$ ]]; then
        echo -e "${RED}Setup cancelado para evitar pérdida de datos.${NC}"
        exit 0
    fi
}

echo -e "${BLUE}"
cat << "EOF"
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║           Kit Fundador v2.0 - Setup                   ║
║                                                       ║
║   Template profesional para proyectos con            ║
║   Clean Architecture + DDD + TDD                      ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

# show_menu displays the technology stack selection menu and a cancel option.
show_menu() {
    echo -e "${YELLOW}Selecciona tu stack tecnológico:${NC}\n"
    echo "  1) TypeScript + Node.js (Express, Jest, Prisma)"
    echo "  2) Python (FastAPI, Pytest, SQLAlchemy)"
    echo "  3) JSON/Config only (para usar con cualquier lenguaje)"
    echo ""
    echo -e "  ${RED}q) Cancelar${NC}"
    echo ""
}

# setup_typescript sets up a TypeScript + Node.js project by copying template files into the workspace, writing config/tech-stack.json describing the stack, and installing npm dependencies if npm is available.
setup_typescript() {
    validate_prerequisites "typescript"
    confirm_overwrite "typescript"
    echo -e "${GREEN}Configurando proyecto TypeScript...${NC}"

    # Copy TypeScript template files
    cp -r templates/typescript/src ./src
    cp -r templates/typescript/tests ./tests
    cp templates/typescript/package.json ./package.json
    cp templates/typescript/tsconfig.json ./tsconfig.json
    cp templates/typescript/jest.config.js ./jest.config.js
    cp templates/typescript/.eslintrc.json ./.eslintrc.json
    cp templates/typescript/.prettierrc ./.prettierrc

    # Update tech-stack.json con el esquema 1.1.0
    cat > config/tech-stack.json << 'JSON_END'
{
  "version": "1.1.0",
  "default_language": "typescript",
  "supported_languages": ["typescript", "python"],
  "runtime": "node",
  "node_version": "20",

  "framework": {
    "backend": "express",
    "alternatives": ["fastify", "hono", "nestjs"],
    "notes": "Express sigue siendo el baseline porque tiene menos magia y es ideal para que el consumidor del starkit reemplace rápidamente por su framework preferido."
  },

  "testing": {
    "framework": "jest",
    "coverage": "nyc",
    "mocking": "jest",
    "e2e": "playwright",
    "load_testing": "k6",
    "contract_testing": "pact",
    "notes": "Los runners listados son de referencia; cada consumidor debe sustituirlos si su stack oficial difiere."
  },

  "linting": {
    "tool": "eslint",
    "config": ".eslintrc.json",
    "plugins": ["@typescript-eslint"],
    "notes": "Placeholder para el perfil TypeScript; ver dev-docs/tooling-guide.md para extender a otros lenguajes."
  },

  "formatting": {
    "tool": "prettier",
    "config": ".prettierrc"
  },

  "build": {
    "tool": "esbuild",
    "output": "dist",
    "notes": "Elección optimizada para cold starts; se puede reemplazar por tsup, swc o webpack según el stack final."
  },

  "database": {
    "primary": "postgresql",
    "orm": "prisma",
    "migrations": "prisma-migrate",
    "version": "16"
  },

  "cache": {
    "tool": "redis",
    "version": "7"
  },

  "observability": {
    "metrics": "prometheus",
    "tracing": "jaeger",
    "logging": "winston",
    "apm": "opentelemetry"
  },

  "ci_cd": {
    "platform": "github_actions",
    "pipeline": ".github/workflows"
  },

  "deployment": {
    "container": "docker",
    "orchestration": "kubernetes",
    "registry": "ghcr.io"
  },

  "package_manager": "npm",

  "git_hooks": "husky",

  "documentation": {
    "api": "openapi",
    "site": "docusaurus"
  },

  "decisions": {
    "language": {
      "choice": "TypeScript + Node.js 20",
      "status": "selected",
      "rationale": "Equilibra seguridad de tipos y compatibilidad con la mayoría de integraciones IA."
    },
    "framework": {
      "choice": "Express minimal + Domain/Application layers independientes",
      "status": "selected",
      "rationale": "Sencillo de extender o reemplazar por frameworks de opinión fuerte."
    },
    "testing": {
      "choice": "Jest (unit) + Playwright (e2e) + Pact (contratos)",
      "status": "selected",
      "rationale": "Cubren pirámide de pruebas y sirven como referencia para otros lenguajes."
    },
    "lint_format": {
      "choice": "ESLint + Prettier",
      "status": "selected",
      "rationale": "Compatibles con monorepos y fáciles de replicar en stacks alternativos."
    },
    "build": {
      "choice": "esbuild",
      "status": "selected",
      "rationale": "Compila rápido el dominio de ejemplo sin imponer pipeline complejo."
    }
  }
}
JSON_END

    echo -e "${GREEN}✓ Archivos TypeScript copiados${NC}"

    # Install dependencies
    if [[ "$SKIP_INSTALLS" == true ]]; then
        echo -e "${BLUE}ℹ SETUP_SH_SKIP_INSTALLS=true → omitiendo npm install.${NC}"
    elif command -v npm &> /dev/null; then
        echo -e "${YELLOW}Instalando dependencias...${NC}"
        npm install
        echo -e "${GREEN}✓ Dependencias instaladas${NC}"
    else
        echo -e "${YELLOW}⚠ npm no encontrado. Instala Node.js y ejecuta: npm install${NC}"
    fi

    echo -e "${GREEN}✓ Proyecto TypeScript configurado correctamente${NC}"
    echo -e "\n${BLUE}Siguiente paso:${NC}"
    echo "  npm run dev              # Iniciar desarrollo"
    echo "  npm test                 # Ejecutar tests"
    echo "  make dev                 # Con Docker Compose"
}

# setup_python configures a Python (FastAPI) project by copying template files, writing a v1.1.0 config/tech-stack.json, creating and activating a virtual environment if python3 is available, installing dependencies from requirements.txt unless SETUP_SH_SKIP_INSTALLS is true, and printing next-step instructions.
setup_python() {
    validate_prerequisites "python"
    confirm_overwrite "python"
    echo -e "${GREEN}Configurando proyecto Python...${NC}"

    # Copy Python template files
    cp -r templates/python/src ./src
    cp -r templates/python/tests ./tests
    cp templates/python/pyproject.toml ./pyproject.toml
    cp templates/python/requirements.txt ./requirements.txt

    # Update tech-stack.json con perfil Python v1.1.0
    cat > config/tech-stack.json << 'JSON_END'
{
  "version": "1.1.0",
  "default_language": "python",
  "supported_languages": ["python"],
  "runtime": "python",
  "python_version": "3.11",

  "framework": {
    "backend": "fastapi",
    "alternatives": ["flask", "django"],
    "notes": "FastAPI sirve como blueprint. Cambia libremente a Flask, Django o frameworks async equivalentes."
  },

  "testing": {
    "framework": "pytest",
    "coverage": "pytest-cov",
    "mocking": "pytest-mock",
    "e2e": "playwright",
    "notes": "Incluye pytest-asyncio y pytest-mock en templates/python para cubrir casos async."
  },

  "linting": {
    "tool": "ruff",
    "config": "pyproject.toml",
    "notes": "Puedes alternar a flake8/pylint si tu stack lo exige."
  },

  "formatting": {
    "tool": "black",
    "config": "pyproject.toml"
  },

  "build": {
    "tool": "uvicorn",
    "output": "app",
    "notes": "El starkit solo provee stubs; reemplaza por tu servidor ASGI favorito o empaquetado con uv."
  },

  "database": {
    "primary": "postgresql",
    "orm": "sqlalchemy",
    "migrations": "alembic",
    "version": "16"
  },

  "cache": {
    "tool": "redis",
    "version": "7"
  },

  "observability": {
    "metrics": "prometheus",
    "tracing": "jaeger (vía OTLP)",
    "logging": "structlog",
    "apm": "opentelemetry"
  },

  "ci_cd": {
    "platform": "github_actions",
    "pipeline": ".github/workflows"
  },

  "deployment": {
    "container": "docker",
    "orchestration": "kubernetes",
    "registry": "ghcr.io"
  },

  "package_manager": "pip",

  "git_hooks": "pre-commit",

  "documentation": {
    "api": "openapi",
    "site": "mkdocs"
  },

  "decisions": {
    "language": {
      "choice": "Python 3.11",
      "status": "selected",
      "rationale": "Equilibrio entre tipado moderno (pydantic v2) y compatibilidad con la mayoría de clouds."
    },
    "framework": {
      "choice": "FastAPI",
      "status": "selected",
      "rationale": "Soporta async/await y OpenAPI nativo, perfecto para plantillas."
    },
    "testing": {
      "choice": "pytest + pytest-asyncio",
      "status": "selected",
      "rationale": "Amplio ecosistema de plugins y fácil de replicar."
    },
    "lint_format": {
      "choice": "ruff + black",
      "status": "selected",
      "rationale": "Proveen lint/format rápidos sin dependencias extras."
    },
    "build": {
      "choice": "uvicorn",
      "status": "selected",
      "rationale": "Simplifica correr stubs ASGI; el consumidor puede sustituirlo."
    }
  }
}
JSON_END

    echo -e "${GREEN}✓ Archivos Python copiados${NC}"

    # Create virtual environment
    if command -v python3 &> /dev/null; then
        echo -e "${YELLOW}Creando entorno virtual...${NC}"
        python3 -m venv venv
        echo -e "${GREEN}✓ Entorno virtual creado${NC}"

        echo -e "${YELLOW}Instalando dependencias...${NC}"
        # shellcheck disable=SC1091
        source venv/bin/activate
        if [[ "$SKIP_INSTALLS" == true ]]; then
            echo -e "${BLUE}ℹ SETUP_SH_SKIP_INSTALLS=true → omitiendo pip install.${NC}"
        elif pip install -r requirements.txt; then
            echo -e "${GREEN}✓ Dependencias instaladas${NC}"
        else
            echo -e "${RED}❌ Error al instalar dependencias${NC}"
            echo -e "${YELLOW}Revisa templates/python/requirements.txt o tu conexión antes de reintentar.${NC}"
            exit 1
        fi
    else
        echo -e "${YELLOW}⚠ python3 no encontrado. Instala Python 3.11+ y ejecuta:${NC}"
        echo "  python3 -m venv venv"
        echo "  source venv/bin/activate"
        echo "  pip install -r requirements.txt"
    fi

    echo -e "${GREEN}✓ Proyecto Python configurado correctamente${NC}"
    echo -e "\n${BLUE}Siguiente paso:${NC}"
    echo "  source venv/bin/activate  # Activar entorno virtual"
    echo "  pytest                    # Ejecutar tests"
    echo "  make dev                  # Con Docker Compose"
}

# setup_json creates a minimal JSON/config-only project structure with placeholder `.gitkeep` files, writes a default `config/tech-stack.json` (version 1.1.0) containing agnostic placeholders, and prints next-step guidance.
setup_json() {
    validate_prerequisites "generic"
    confirm_overwrite "generic"
    echo -e "${GREEN}Configurando proyecto con solo JSON/Config...${NC}"

    # Create minimal structure
    mkdir -p src/domain/entities
    mkdir -p src/domain/value_objects
    mkdir -p src/application/use_cases
    mkdir -p src/infrastructure
    mkdir -p tests/unit
    mkdir -p tests/integration
    mkdir -p tests/e2e

    # Create placeholder files
    touch src/domain/entities/.gitkeep
    touch src/domain/value_objects/.gitkeep
    touch src/application/use_cases/.gitkeep
    touch src/infrastructure/.gitkeep
    touch tests/unit/.gitkeep
    touch tests/integration/.gitkeep
    touch tests/e2e/.gitkeep

    # Update tech-stack.json con un perfil agnóstico 1.1.0
    cat > config/tech-stack.json << 'JSON_END'
{
  "version": "1.1.0",
  "default_language": "to_be_defined",
  "supported_languages": [],
  "runtime": "to_be_defined",

  "framework": {
    "backend": "to_be_defined",
    "notes": "Utiliza este archivo como checklist para definir tu propio stack."
  },

  "testing": {
    "framework": "to_be_defined",
    "notes": "Define runners unitarios, de integración y e2e según tu lenguaje."
  },

  "linting": {
    "tool": "to_be_defined"
  },

  "formatting": {
    "tool": "to_be_defined"
  },

  "build": {
    "tool": "to_be_defined",
    "notes": "Puede ser make, bazel, gradle, cargo, etc."
  },

  "database": {
    "primary": "postgresql",
    "version": "16",
    "notes": "El blueprint en dev-docs/infrastructure/database-blueprint.md explica cómo crear migrations agnósticas."
  },

  "cache": {
    "tool": "redis",
    "version": "7"
  },

  "observability": {
    "metrics": "prometheus",
    "tracing": "jaeger",
    "logging": "to_be_defined",
    "apm": "opentelemetry"
  },

  "ci_cd": {
    "platform": "github_actions",
    "pipeline": "to_be_defined"
  },

  "deployment": {
    "container": "docker",
    "orchestration": "to_be_defined"
  },

  "package_manager": "to_be_defined",

  "git_hooks": "to_be_defined",

  "documentation": {
    "api": "openapi",
    "site": "to_be_defined"
  },

  "decisions": {
    "language": {
      "choice": "pendiente",
      "status": "pending",
      "rationale": "Completa este archivo tras seleccionar tu lenguaje base."
    }
  }
}
JSON_END

    echo -e "${GREEN}✓ Estructura base creada${NC}"
    echo -e "${GREEN}✓ Configuración JSON lista${NC}"
    echo -e "\n${BLUE}Siguiente paso:${NC}"
    echo "  1. Edita config/tech-stack.json con tu configuración"
    echo "  2. Implementa tu código en src/ siguiendo Clean Architecture"
    echo "  3. Revisa dev-docs/ para guías de arquitectura"
}

# cleanup_templates presents options for handling the templates/ directory, lets the user keep it, move it to .templates/, or delete it, and performs the selected action.
cleanup_templates() {
    if [[ ! -d templates ]]; then
        return
    fi

    echo -e "${YELLOW}Opciones para templates/${NC}"
    echo "  1) Conservarlos para referencia (opción por defecto)"
    echo "  2) Moverlos a .templates/ (ocultar del árbol principal)"
    echo "  3) Eliminarlos (${RED}acción irreversible${NC})"

    read -r -p "Selecciona una opción [1/2/3]: " template_choice
    case $template_choice in
        2)
            rm -rf .templates
            mv templates .templates
            echo -e "${GREEN}✓ Templates movidos a .templates/${NC}"
            ;;
        3)
            rm -rf templates
            echo -e "${GREEN}✓ Templates eliminados${NC}"
            ;;
        *)
            echo -e "${BLUE}ℹ Templates conservados en templates/${NC}"
            ;;
    esac
}

# warn_missing_compose_file warns if docker-compose.dev.yml is absent and prints a warning explaining that Makefile targets using Docker Compose will fail and suggesting copying the example from templates or adjusting the Makefile.
warn_missing_compose_file() {
    if [[ -f docker-compose.dev.yml ]]; then
        return
    fi

    echo -e "${YELLOW}⚠ docker-compose.dev.yml no encontrado.${NC}"
    echo -e "${BLUE}  Los comandos del Makefile que invocan Docker Compose (make dev/test/seed) fallarán hasta que crees uno.${NC}"
    echo -e "${BLUE}  Copia el ejemplo desde templates/ o ajusta el Makefile a tus propios servicios antes de usarlo.${NC}"
}

# update_context writes .context/project-state.json recording initialization timestamp, selected language, phase, and a default last_session with suggested next steps.
# update_context updates .context/project-state.json with project metadata, AI context, and metrics for the given language and timestamp.
# It accepts a language identifier (e.g., "typescript", "python", "generic") as the first argument and an optional timestamp as the second argument (defaults to utc_timestamp).
# When python3 is available it merges into an existing JSON file; otherwise it writes a default payload. The function ensures the file version is "2.0.0" and sets a sensible tech_stack_hash for known languages.
update_context() {
    local lang=$1
    local timestamp=${2:-$(utc_timestamp)}

    echo -e "${YELLOW}Actualizando contexto del proyecto...${NC}"

    local summary="Project initialized with $lang stack"

    if command -v python3 &> /dev/null; then
        python3 - "$lang" "$timestamp" "$summary" <<'PY'
import json
import sys
from pathlib import Path

lang = sys.argv[1]
timestamp = sys.argv[2]
summary = sys.argv[3]
path = Path(".context/project-state.json")

TECH_HASH = {
    "typescript": "typescript-node20-express-jest-esbuild",
    "python": "python3.11-fastapi-pytest-uvicorn",
    "generic": "generic-agnostic-config-only"
}

def base_payload():
    return {
        "version": "2.0.0",
        "last_updated": timestamp,
        "project_metadata": {
            "name": "nombre-proyecto",
            "domain": "dominio-negocio",
            "stage": "foundation",
            "tech_stack_hash": TECH_HASH.get(lang, f"{lang}-stack")
        },
        "current_state": {
            "active_bounded_contexts": [],
            "implemented_aggregates": [],
            "pending_migrations": [],
            "active_feature_flags": {},
            "technical_debt_items": []
        },
        "ai_context": {
            "last_session_summary": summary,
            "last_session_timestamp": timestamp,
            "next_recommended_tasks": ["TASK-003", "TASK-004", "TASK-015"],
            "areas_needing_attention": [],
            "recent_decisions": []
        },
        "metrics": {
            "test_coverage": 0,
            "cyclomatic_complexity_avg": 0,
            "dependency_count": 0,
            "last_build_time_ms": 0
        }
    }

if path.exists():
    try:
        with path.open() as fh:
            data = json.load(fh)
    except json.JSONDecodeError:
        data = base_payload()
else:
    data = base_payload()

data["version"] = "2.0.0"
data["last_updated"] = timestamp

meta = data.setdefault("project_metadata", {})
meta.setdefault("name", "nombre-proyecto")
meta.setdefault("domain", "dominio-negocio")
meta.setdefault("stage", "foundation")
meta["tech_stack_hash"] = TECH_HASH.get(lang, meta.get("tech_stack_hash", f"{lang}-stack"))

current = data.setdefault("current_state", {})
current.setdefault("active_bounded_contexts", [])
current.setdefault("implemented_aggregates", [])
current.setdefault("pending_migrations", [])
current.setdefault("active_feature_flags", {})
current.setdefault("technical_debt_items", [])

ai = data.setdefault("ai_context", {})
ai["last_session_summary"] = summary
ai["last_session_timestamp"] = timestamp
ai.setdefault("next_recommended_tasks", ["TASK-003", "TASK-004", "TASK-015"])
ai.setdefault("areas_needing_attention", [])
ai.setdefault("recent_decisions", [])

metrics = data.setdefault("metrics", {})
metrics.setdefault("test_coverage", 0)
metrics.setdefault("cyclomatic_complexity_avg", 0)
metrics.setdefault("dependency_count", 0)
metrics.setdefault("last_build_time_ms", 0)

with path.open("w") as fh:
    json.dump(data, fh, indent=2)
    fh.write("\n")
PY
    else
        cat > .context/project-state.json <<JSON_END
{
  "version": "2.0.0",
  "last_updated": "$timestamp",
  "project_metadata": {
    "name": "nombre-proyecto",
    "domain": "dominio-negocio",
    "stage": "foundation",
    "tech_stack_hash": "${lang}-stack"
  },
  "current_state": {
    "active_bounded_contexts": [],
    "implemented_aggregates": [],
    "pending_migrations": [],
    "active_feature_flags": {},
    "technical_debt_items": []
  },
  "ai_context": {
    "last_session_summary": "$summary",
    "last_session_timestamp": "$timestamp",
    "next_recommended_tasks": ["TASK-003", "TASK-004", "TASK-015"],
    "areas_needing_attention": [],
    "recent_decisions": []
  },
  "metrics": {
    "test_coverage": 0,
    "cyclomatic_complexity_avg": 0,
    "dependency_count": 0,
    "last_build_time_ms": 0
  }
}
JSON_END
    fi

    echo -e "${GREEN}✓ Contexto actualizado${NC}"
}

# Main menu loop
while true; do
    show_menu
    read -p "Opción: " choice

    case $choice in
        1)
            setup_typescript
            update_context "typescript"
            cleanup_templates
            warn_missing_compose_file
            break
            ;;
        2)
            setup_python
            update_context "python"
            cleanup_templates
            warn_missing_compose_file
            break
            ;;
        3)
            setup_json
            update_context "generic"
            cleanup_templates
            warn_missing_compose_file
            break
            ;;
        q|Q)
            echo -e "${RED}Setup cancelado${NC}"
            exit 0
            ;;
        *)
            echo -e "${RED}Opción inválida. Intenta de nuevo.${NC}\n"
            ;;
    esac
done

echo ""
echo -e "${GREEN}╔═══════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                                                       ║${NC}"
echo -e "${GREEN}║          ✓ Setup completado con éxito                 ║${NC}"
echo -e "${GREEN}║                                                       ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}📚 Documentación importante:${NC}"
echo "  • dev-docs/context.md          - Contexto del proyecto"
echo "  • dev-docs/task.md             - Backlog de tareas"
echo "  • config/rules/ai-guardrails.json - Reglas para IA"
echo ""
echo -e "${BLUE}🚀 Comandos útiles:${NC}"
echo "  • make dev      - Iniciar entorno de desarrollo"
echo "  • make test     - Ejecutar tests"
echo "  • make validate - Validar arquitectura"
echo "  • make help     - Ver todos los comandos"
echo ""
echo -e "${GREEN}¡Listo para empezar a codificar!${NC}"