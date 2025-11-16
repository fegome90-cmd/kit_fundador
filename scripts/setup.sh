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
    echo -e "${GREEN}Configurando proyecto TypeScript...${NC}"

    # Copy TypeScript template files
    cp -r templates/typescript/src ./src
    cp -r templates/typescript/tests ./tests
    cp templates/typescript/package.json ./package.json
    cp templates/typescript/tsconfig.json ./tsconfig.json
    cp templates/typescript/jest.config.js ./jest.config.js
    cp templates/typescript/.eslintrc.json ./.eslintrc.json
    cp templates/typescript/.prettierrc ./.prettierrc

    # Update tech-stack.json
    cat > config/tech-stack.json << 'JSON_END'
{
  "version": "1.0.0",
  "language": "typescript",
  "runtime": "node",
  "node_version": "20",

  "framework": {
    "backend": "express",
    "alternatives": ["fastify", "hono", "nestjs"]
  },

  "testing": {
    "framework": "jest",
    "coverage": "nyc",
    "mocking": "jest",
    "e2e": "playwright"
  },

  "database": {
    "primary": "postgresql",
    "orm": "prisma",
    "version": "16"
  }
}
JSON_END

    echo -e "${GREEN}✓ Archivos TypeScript copiados${NC}"

    # Install dependencies
    if command -v npm &> /dev/null; then
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

# setup_python configures a Python (FastAPI) project by copying template files, writing config/tech-stack.json, creating a virtual environment and installing dependencies if python3 is available, and printing next-step instructions.
setup_python() {
    echo -e "${GREEN}Configurando proyecto Python...${NC}"

    # Copy Python template files
    cp -r templates/python/src ./src
    cp -r templates/python/tests ./tests
    cp templates/python/pyproject.toml ./pyproject.toml
    cp templates/python/requirements.txt ./requirements.txt

    # Update tech-stack.json
    cat > config/tech-stack.json << 'JSON_END'
{
  "version": "1.0.0",
  "language": "python",
  "runtime": "python",
  "python_version": "3.11",

  "framework": {
    "backend": "fastapi",
    "alternatives": ["flask", "django"]
  },

  "testing": {
    "framework": "pytest",
    "coverage": "pytest-cov",
    "mocking": "pytest-mock",
    "e2e": "playwright"
  },

  "database": {
    "primary": "postgresql",
    "orm": "sqlalchemy",
    "version": "16"
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
        source venv/bin/activate
        pip install -r requirements.txt
        echo -e "${GREEN}✓ Dependencias instaladas${NC}"
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

# setup_json creates a minimal JSON/config-only project structure with placeholder `.gitkeep` files, writes a default `config/tech-stack.json`, and prints next-step guidance.
setup_json() {
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

    # Update tech-stack.json
    cat > config/tech-stack.json << 'JSON_END'
{
  "version": "1.0.0",
  "language": "generic",
  "runtime": "to_be_defined",

  "framework": {
    "backend": "to_be_defined"
  },

  "testing": {
    "framework": "to_be_defined"
  },

  "database": {
    "primary": "postgresql",
    "version": "16"
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

# cleanup_templates prints a notice that template files are being cleaned from the project, reminds the user that the templates/ directory is kept for reference, and shows the command to remove it (rm -rf templates/).
cleanup_templates() {
    echo -e "${YELLOW}Limpiando templates...${NC}"

    # Keep templates directory for reference but remove from main project
    # You can delete templates/ directory if you want
    echo -e "${BLUE}ℹ Los templates están en templates/ por si necesitas referencia${NC}"
    echo -e "${BLUE}  Puedes eliminar templates/ cuando quieras: rm -rf templates/${NC}"
}

# update_context writes .context/project-state.json recording initialization timestamp, selected language, phase, and a default last_session with suggested next steps.
# Accepts a single argument `lang` that is stored as the project's language identifier (e.g., "typescript", "python", "generic").
update_context() {
    local lang=$1

    echo -e "${YELLOW}Actualizando contexto del proyecto...${NC}"

    # Update project-state.json
    cat > .context/project-state.json << JSON_END
{
  "version": "1.0.0",
  "initialized": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "language": "$lang",
  "phase": "setup",
  "aggregates_implemented": [],
  "bounded_contexts": [],
  "last_session": {
    "date": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
    "summary": "Project initialized with $lang stack",
    "next_steps": [
      "Review dev-docs/context.md",
      "Define domain model in dev-docs/domain/ubiquitous-language.md",
      "Start implementing domain entities",
      "Write tests following TDD"
    ]
  }
}
JSON_END

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
            break
            ;;
        2)
            setup_python
            update_context "python"
            cleanup_templates
            break
            ;;
        3)
            setup_json
            update_context "generic"
            cleanup_templates
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