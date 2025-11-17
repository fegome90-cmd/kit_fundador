.PHONY: help dev up down logs test migrate seed clean

PROJECT_NAME := myapp
COMPOSE := docker-compose -f docker-compose.dev.yml -p $(PROJECT_NAME)

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

dev: ## Start development environment
	$(COMPOSE) up app postgres redis

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
	$(COMPOSE) exec postgres psql -U dev -d myapp_dev

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
	@$(COMPOSE) exec postgres pg_isready -U dev || echo "❌ Postgres unhealthy"
	@$(COMPOSE) exec redis redis-cli ping || echo "❌ Redis unhealthy"
