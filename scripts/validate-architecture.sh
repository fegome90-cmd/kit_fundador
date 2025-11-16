#!/bin/bash
# Validación automática de reglas arquitectónicas

set -e

echo "🏗️  Validando arquitectura..."

# Detectar lenguaje
if [ -f "package.json" ]; then
    LANG="typescript"
elif [ -f "go.mod" ]; then
    LANG="go"
elif [ -f "requirements.txt" ]; then
    LANG="python"
else
    echo "⚠️  No se detectó lenguaje, saltando validación"
    exit 0
fi

# Validar dependencias de domain layer
echo "📦 Validando domain layer no tiene dependencias prohibidas..."

case $LANG in
    typescript)
        # Verificar que domain/ no importa de infrastructure/
        if find src/domain -type f -name "*.ts" -exec grep -l "from.*infrastructure" {} \; 2>/dev/null | grep -q .; then
            echo "❌ ERROR: Domain layer importa desde infrastructure"
            find src/domain -type f -name "*.ts" -exec grep -l "from.*infrastructure" {} \;
            exit 1
        fi
        
        echo "✅ Domain layer no tiene imports prohibidos"
        ;;
        
    go)
        if find domain -type f -name "*.go" -exec grep -l "\".*infrastructure" {} \; 2>/dev/null | grep -q .; then
            echo "❌ ERROR: Domain importa infrastructure"
            exit 1
        fi
        echo "✅ Domain layer limpio"
        ;;
        
    python)
        if find src/domain -type f -name "*.py" -exec grep -l "from.*infrastructure" {} \; 2>/dev/null | grep -q .; then
            echo "❌ ERROR: Domain importa infrastructure"
            exit 1
        fi
        echo "✅ Domain layer limpio"
        ;;
esac

# Verificar que existen los archivos de documentación obligatorios
echo "📝 Validando documentación obligatoria..."

REQUIRED_DOCS=(
    "dev-docs/domain/ubiquitous-language.md"
    "dev-docs/domain/invariants.md"
    ".context/project-state.json"
    "config/rules/ai-guardrails.json"
)

MISSING=0
for doc in "${REQUIRED_DOCS[@]}"; do
    if [ ! -f "$doc" ]; then
        echo "⚠️  WARNING: Falta $doc"
        MISSING=$((MISSING + 1))
    fi
done

if [ $MISSING -eq 0 ]; then
    echo "✅ Toda la documentación requerida está presente"
fi

# Verificar estructura de directorios
echo "📂 Validando estructura de directorios..."

REQUIRED_DIRS=(
    "src/domain"
    "src/application"
    "src/infrastructure"
    "tests/unit"
    "tests/integration"
)

for dir in "${REQUIRED_DIRS[@]}"; do
    if [ ! -d "$dir" ]; then
        echo "⚠️  WARNING: Falta directorio $dir"
    fi
done

echo "✅ Validación completada"
