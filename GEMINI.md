# Kit Fundador Project

## Project Overview

This project is a full-stack application initiated with the "Kit Fundador v2.0" framework, emphasizing a robust development methodology that includes Clean Architecture, Domain-Driven Design (DDD), and Test-Driven Development (TDD).

It comprises:

- **Backend**: A Node.js application built with TypeScript, Express.js, PostgreSQL for data persistence, and Redis for caching/messaging. It includes a comprehensive setup for observability with Prometheus, Grafana, and Jaeger.
- **Frontend**: A React application built with TypeScript and Vite, styled using Tailwind CSS, and incorporating modern UI components and animation libraries.
- **Development Environment**: Fully containerized using Docker and Docker Compose, providing a consistent and isolated environment for all services (app, database, cache, observability tools).

The project structure is designed for scalability, maintainability, and quality, with clear separation of concerns and dedicated documentation for development practices and known limitations.

## Building and Running

The project leverages Docker Compose for managing its multi-service development environment.

### Prerequisites

- Docker and Docker Compose installed.
- Node.js and npm (if running frontend or specific npm scripts outside Docker).

### Core Commands

All major development operations are orchestrated via `Makefile` for convenience.

- **Start Development Environment**: Starts the backend application, PostgreSQL, and Redis.

  ```bash
  make dev
  ```

- **Start All Services (detached)**: Starts all services including Prometheus, Grafana, and Jaeger in the background.

  ```bash
  make up
  ```

- **Stop All Services**:

  ```bash
  make down
  ```

- **View Application Logs**:

  ```bash
  make logs
  ```

- **Run Backend Tests (inside Docker)**:

  ```bash
  make test
  # For specific tests:
  # make test-unit
  # make test-integration
  # make test-e2e
  ```

- **Run Database Migrations**:

  ```bash
  make migrate
  # To rollback last migration:
  # make migrate-down
  ```

- **Seed Development Data**:

  ```bash
  make seed
  ```

- **Access App Shell (inside Docker)**:

  ```bash
  make shell
  ```

- **Clean and Reset Environment**: Stops, removes containers and volumes, then restarts and migrates the database.

  ```bash
  make reset
  ```

### Frontend Development

The frontend application resides in the `web/` directory.

- **Start Frontend Development Server**: (Requires Node.js and npm installed locally)

  ```bash
  cd web
  npm install
  npm run dev
  ```

  This will typically start the frontend on `http://localhost:5173` (or another port as configured by Vite).

## Development Conventions

The project enforces high code quality and consistency through various tools and practices:

- **Linting**: ESLint is used for static code analysis in both backend (`npm run lint`) and frontend (`web/npm run lint`).
- **Formatting**: Prettier is configured for automatic code formatting (`npm run format`).
- **Typing**: TypeScript is used throughout the project (`npm run type-check`) to ensure type safety.
- **Testing**: Jest is the testing framework, with dedicated scripts for unit, integration, and end-to-end tests. The `tests/setup` directory contains testing setup scripts.
- **Architectural Validation**: The `make validate` command likely runs custom scripts to ensure architectural rules are followed.
- **Git Hooks**: Husky is configured to run pre-commit and other Git hooks to enforce code quality standards before commits.

## Known Limitations

- **JSON Parsing in User Registration**: The `POST /api/users/register` endpoint has a known limitation with complex JSON payloads. More details can be found in `dev-docs/known-limitations/JSON-Parsing-Limitation.md`. A workaround is available for Phase 2.
