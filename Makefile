.PHONY: help dev up down logs test migrate seed clean db-up db-down db-reset test-setup

PROJECT_NAME := myapp
COMPOSE := docker compose -f docker-compose.dev.yml -p $(PROJECT_NAME)

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

dev: ## Start development environment
	$(COMPOSE) up app db redis

up: ## Start all services
	$(COMPOSE) up -d

down: ## Stop all services
	$(COMPOSE) down

logs: ## Show logs
	$(COMPOSE) logs -f app

test: ## Run tests in container
	$(COMPOSE) run --rm app npm test

test-watch: ## Run tests in watch mode
	$(COMPOSE) run --rm app npm run test:watch

test-coverage: ## Run tests with coverage
	$(COMPOSE) run --rm app npm run test:coverage

test-setup: ## Run setup.sh harness locally
	bash tests/setup/setup_script.test.sh

migrate: ## Run database migrations
	$(COMPOSE) run --rm app npm run migrate:up

migrate-down: ## Rollback last migration
	$(COMPOSE) run --rm app npm run migrate:down

seed: ## Seed development data
	$(COMPOSE) run --rm app npm run seed:dev

shell: ## Open shell in app container
	$(COMPOSE) exec app sh

db-shell: ## Open PostgreSQL shell
	$(COMPOSE) exec db psql -U ${DB_USER:-dev} -d ${DB_NAME:-myapp_dev}

lint: ## Run linter
	$(COMPOSE) run --rm app npm run lint

format: ## Format code
	$(COMPOSE) run --rm app npm run format

validate: ## Validate architecture rules
	$(COMPOSE) run --rm app ./scripts/validate-architecture.sh

clean: ## Clean all containers and volumes
	$(COMPOSE) down -v
	docker system prune -f

reset: clean up migrate seed ## Full reset of environment

health: ## Check health of all services
	@echo "Checking services health..."
	@curl -f http://localhost:3000/health || echo "❌ App unhealthy"
	@$(COMPOSE) exec db pg_isready -U ${DB_USER:-dev} || echo "❌ Postgres unhealthy"
	@$(COMPOSE) exec redis redis-cli ping || echo "❌ Redis unhealthy"

db-up: ## Start only the database service
	$(COMPOSE) up -d db

db-down: ## Stop only the database service
	$(COMPOSE) stop db

db-reset: ## Recreate the database container and volume
	$(COMPOSE) stop db || true
	$(COMPOSE) rm -f db || true
	docker volume rm $(PROJECT_NAME)_db-data || true
	$(MAKE) db-up
