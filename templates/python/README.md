# Kit Fundador v2 - Python Template

Template de Python con Clean Architecture + DDD + TDD.

## Stack Tecnológico

- **Runtime**: Python 3.11+
- **Framework**: FastAPI 0.109+
- **Testing**: Pytest 7.4+ + pytest-cov
- **ORM**: SQLAlchemy (PostgreSQL 16)
- **Cache**: Redis 7
- **Linting**: Ruff + Black + mypy
- **Git Hooks**: pre-commit

## Estructura del Código

```
src/
├── domain/              # Core business logic (NO dependencies)
│   ├── entities/       # user.py (example)
│   └── value_objects/  # email.py (example)
├── application/        # Use cases, handlers
└── infrastructure/     # FastAPI, SQLAlchemy, Redis

tests/
├── unit/              # 70% - Domain logic
├── integration/       # 20% - Repositories, APIs
└── e2e/               # 10% - Critical paths
```

## Instalación

```bash
# Crear entorno virtual
python3 -m venv venv
source venv/bin/activate  # Linux/Mac
# o
venv\Scripts\activate  # Windows

# Instalar dependencias
pip install -r requirements.txt

# O con pyproject.toml
pip install -e ".[dev]"
```

## Comandos Disponibles

```bash
# Testing
pytest                          # Todos los tests
pytest tests/unit              # Solo unitarios
pytest tests/integration       # Solo integración
pytest --cov                   # Con coverage
pytest --cov --cov-report=html # Coverage HTML

# Calidad de código
ruff check src/                # Linting
ruff check --fix src/          # Autofix
black src/ tests/              # Formateo
mypy src/                      # Type checking

# Desarrollo
uvicorn src.main:app --reload  # Servidor de desarrollo
```

## Configuraciones Importantes

### pyproject.toml
- Coverage mínimo: 80%
- mypy strict mode
- ruff con reglas estrictas (complejidad, pep8, etc.)

### pytest
- Markers: `@pytest.mark.unit`, `@pytest.mark.integration`, `@pytest.mark.e2e`
- Coverage automático en todas las ejecuciones

### Type Checking (mypy)
- Strict mode activado
- No implicit optional
- Warn unused ignores

## Ejemplos Incluidos

### Email Value Object
```python
from src.domain.value_objects.email import Email

email = Email.create('user@example.com')
print(email.value)  # 'user@example.com'
```

### User Entity
```python
from src.domain.entities.user import User, UserRole
from src.domain.value_objects.email import Email

user = User.create(
    email=Email.create('user@example.com'),
    name='John Doe',
    password_hash='hashed_password',
    role=UserRole.USER,
)

user.verify_email()
print(user.email_verified)  # True
```

## Testing con Pytest

```python
def test_create_valid_user():
    # Arrange
    email = Email.create('test@example.com')

    # Act
    user = User.create(
        email=email,
        name='Test User',
        password_hash='hash123',
    )

    # Assert
    assert user.id is not None
    assert user.name == 'Test User'
```

## Próximos Pasos

1. Implementar capas Application e Infrastructure
2. Configurar SQLAlchemy models
3. Crear migraciones con Alembic
4. Implementar use cases con FastAPI
5. Configurar CI/CD en `.github/workflows/`

## Reglas Arquitectónicas

- ✅ Domain NO puede importar Application ni Infrastructure
- ✅ Application puede importar Domain
- ✅ Infrastructure puede importar ambos

Valida con: `make validate` o `./scripts/validate-architecture.sh`

## Convenciones Python

- Nombres de archivos: `snake_case.py`
- Nombres de clases: `PascalCase`
- Funciones y variables: `snake_case`
- Constantes: `UPPER_CASE`
- Privado: `_prefijo_simple`
