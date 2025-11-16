# Kit Fundador v2 - TypeScript Template

Template de TypeScript con Clean Architecture + DDD + TDD.

## Stack Tecnológico

- **Runtime**: Node.js 20
- **Lenguaje**: TypeScript 5.0 (strict mode)
- **Framework**: Express 4.18
- **Testing**: Jest 29 + ts-jest
- **ORM**: Prisma (PostgreSQL 16)
- **Cache**: Redis 7
- **Linting**: ESLint + Prettier
- **Git Hooks**: Husky + lint-staged

## Estructura del Código

```
src/
├── domain/              # Core business logic (NO dependencies)
│   ├── entities/       # User.ts (example)
│   └── value-objects/  # Email.ts (example)
├── application/        # Use cases, handlers
└── infrastructure/     # Express, Prisma, Redis

tests/
├── unit/              # 70% - Domain logic
├── integration/       # 20% - Repositories, APIs
└── e2e/               # 10% - Critical paths
```

## Scripts Disponibles

```bash
# Desarrollo
npm run dev              # Hot-reload con nodemon
npm run build            # Compilar TypeScript
npm start                # Ejecutar build

# Testing
npm test                 # Todos los tests
npm run test:unit        # Solo unitarios
npm run test:integration # Solo integración
npm run test:watch       # Modo watch
npm run test:coverage    # Con coverage

# Calidad de código
npm run lint             # ESLint
npm run lint:fix         # ESLint con autofix
npm run format           # Prettier
npm run type-check       # TypeScript check

# Base de datos
npm run migrate:up       # Ejecutar migraciones
npm run migrate:down     # Rollback
npm run seed:dev         # Seed data
```

## Configuraciones Importantes

### TypeScript (tsconfig.json)
- Strict mode activado
- Path aliases: `@domain/*`, `@application/*`, `@infrastructure/*`
- Target: ES2022

### ESLint (.eslintrc.json)
- Max líneas por función: 20
- Max parámetros: 3
- Complejidad máxima: 10
- No `any` permitido

### Jest (jest.config.js)
- Coverage mínimo: 80% en todas las métricas
- Path mapping alineado con tsconfig

## Ejemplos Incluidos

### Email Value Object
```typescript
const email = Email.create('user@example.com');
console.log(email.value); // 'user@example.com'
```

### User Entity
```typescript
const user = User.create({
  email: Email.create('user@example.com'),
  name: 'John Doe',
  password: Password.create('SecurePass123!'),
});

user.verifyEmail();
console.log(user.emailVerified); // true
```

## Próximos Pasos

1. Implementar capas Application e Infrastructure
2. Configurar Prisma schema
3. Crear migraciones de base de datos
4. Implementar use cases
5. Configurar CI/CD en `.github/workflows/`

## Reglas Arquitectónicas

- ✅ Domain NO puede importar Application ni Infrastructure
- ✅ Application puede importar Domain
- ✅ Infrastructure puede importar ambos

Valida con: `make validate` o `./scripts/validate-architecture.sh`
