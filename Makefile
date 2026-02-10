# ---------------------------------------
# Project configuration
# ---------------------------------------
PROJECT_NAME=chess-agent
FRONTEND_SERVICE=frontend
BACKEND_SERVICE=backend
DOCKER_COMPOSE=docker compose

# ---------------------------------------
# Basic lifecycle
# ---------------------------------------

.PHONY: help up down build logs restart clean

help:
	@echo ""
	@echo "$(PROJECT_NAME) - Available commands:"
	@echo "--------------------------------------------------"
	@echo " make up              Start all containers"
	@echo " make down            Stop and remove containers"
	@echo " make build           Build or rebuild services"
	@echo " make logs            Show logs from all containers"
	@echo " make restart         Restart all services"
	@echo " make clean           Remove containers, volumes, cache"
	@echo ""
	@echo "Backend / Frontend commands:"
	@echo " make backend-shell   Open a shell in the backend container"
	@echo " make frontend-shell  Open a shell in the frontend container"
	@echo " make gen-angular     Generate a fresh Angular app"
	@echo ""

# ---------------------------------------
# Docker management
# ---------------------------------------

up:
	$(DOCKER_COMPOSE) up

down:
	$(DOCKER_COMPOSE) down

build:
	$(DOCKER_COMPOSE) build

logs:
	$(DOCKER_COMPOSE) logs -f

restart: down up

clean:
	$(DOCKER_COMPOSE) down -v --remove-orphans
	docker system prune -f

# ---------------------------------------
# Containers utilities
# ---------------------------------------

backend-shell:
	$(DOCKER_COMPOSE) exec $(BACKEND_SERVICE) /bin/bash || \
	$(DOCKER_COMPOSE) exec $(BACKEND_SERVICE) sh

frontend-shell:
	$(DOCKER_COMPOSE) exec $(FRONTEND_SERVICE) /bin/sh

# ---------------------------------------
# Frontend helper
# ---------------------------------------

init-frontend:
	@echo "Installing npm dependencies for Angular frontend..."
	docker run --rm -it \
		-v $(PWD)/frontend:/usr/src/app \
		-w /usr/src/app \
		node:18-alpine \
		sh -c "npm install --legacy-peer-deps --loglevel=info"

# ---------------------------------------
# Healthcheck / Development
# ---------------------------------------

check:
	curl -s http://localhost:8000/api/v1/healthcheck | jq


init-milvus:
	docker compose exec backend python -m app.rag.load_milvus