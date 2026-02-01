# Makefile
# --------
# This Makefile provides a simple, consistent interface for working with the
# RAG-Assisted Chess Agent project. It is intended for local development,
# experimentation, and demonstration purposes (not production deployment).

# ---------------------------------------
# Project configuration
# ---------------------------------------
# Project-level variables used throughout the Makefile
# These define service names and tooling used by Docker Compose
PROJECT_NAME=chess-agent
FRONTEND_SERVICE=frontend
BACKEND_SERVICE=backend
DOCKER_COMPOSE=docker compose

# ---------------------------------------
# Basic lifecycle
# ---------------------------------------
# Core lifecycle commands for starting, stopping, and rebuilding the project

# Display a list of available Makefile commands and their purpose
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

# Start all project services using Docker Compose
up:
	$(DOCKER_COMPOSE) up

# Stop all running containers (does not remove volumes)
down:
	$(DOCKER_COMPOSE) down

# Build or rebuild Docker images for all services
build:
	$(DOCKER_COMPOSE) build

# Stream logs from all running containers
logs:
	$(DOCKER_COMPOSE) logs -f

# Restart all services (equivalent to make down && make up)
restart: down up

# Remove containers, volumes, and unused Docker resources (clean slate)
clean:
	$(DOCKER_COMPOSE) down -v --remove-orphans
	docker system prune -f

# ---------------------------------------
# Containers utilities
# ---------------------------------------
# Helper commands for opening interactive shells inside running containers

# Open an interactive shell inside the backend container (bash or sh fallback)
backend-shell:
	$(DOCKER_COMPOSE) exec $(BACKEND_SERVICE) /bin/bash || \
	$(DOCKER_COMPOSE) exec $(BACKEND_SERVICE) sh

# Open an interactive shell inside the frontend container
frontend-shell:
	$(DOCKER_COMPOSE) exec $(FRONTEND_SERVICE) /bin/sh

# ---------------------------------------
# Frontend helper
# ---------------------------------------
# Utility for initializing frontend dependencies without installing Node locally

# Install npm dependencies for the Angular frontend using a temporary Node container
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
# Development and diagnostic helpers

# Call the backend healthcheck endpoint to verify the API is running
check:
	curl -s http://localhost:8000/api/v1/healthcheck | jq

# Initialize or reindex the Milvus vector database with chess knowledge
# (used for RAG-based retrieval)
init-milvus:
	docker compose exec backend python -m app.rag.load_milvus