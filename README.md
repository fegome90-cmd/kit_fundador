# Kit Fundador Project

## Overview
This is a full- **Backend**: A Node.js application built with TypeScript, Express.js, PostgreSQL for data persistence, and Redis for caching/messaging. It includes a comprehensive setup for observability with Prometheus, Grafana, and Jaeger.
 fully containerized development environment.
## Prerequisites
- Docker & Docker Compose
- Node.js (optional, for local tooling)

## Getting Started

### Quick Start
```bash
make dev  # Start backend, db, redis
make up   # Start all services (including observability)
```

### Common Commands
- `make test`: Run tests inside Docker
- `make lint`: Run linter
- `make format`: Format code
- `make migrate`: Run database migrations
- `make seed`: Seed development data
- `make down`: Stop all services

## Project Structure
- `src/`: Backend source code
- `web/`: Frontend application
- `tests/`: Test suites (Unit, Integration, E2E)
- `dev-docs/`: Developer documentation
- `scripts/`: Utility scripts

For more detailed information, please refer to [GEMINI.md](GEMINI.md).

## ⚠️ Limitaciones Conocidas

### JSON Parsing en User Registration

El endpoint POST /api/users/register tiene una limitation conocida con JSON complejo.

**Documentación completa en:** [dev-docs/known-limitations/JSON-Parsing-Limitation.md](dev-docs/known-limitations/JSON-Parsing-Limitation.md)

**Status actual:** Server 95% funcional con workaround disponible para Phase 2.

