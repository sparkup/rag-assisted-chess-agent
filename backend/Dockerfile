# --- Stage 1: build deps into a venv ---
FROM python:3.11-slim AS builder
ENV DEBIAN_FRONTEND=noninteractive
WORKDIR /app
# Enable better caching for dependency installs (works best with Docker BuildKit)
ENV UV_CACHE_DIR=/root/.cache/uv \
    PIP_DISABLE_PIP_VERSION_CHECK=1

RUN --mount=type=cache,target=/var/cache/apt,sharing=locked \
    --mount=type=cache,target=/var/lib/apt,sharing=locked \
    apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

RUN --mount=type=cache,target=/root/.cache/pip,sharing=locked \
    pip install --no-cache-dir uv

RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

COPY pyproject.toml ./
# If you have a lock file (uv.lock), copy it too for reproducible + cacheable builds.
COPY uv.lock* ./

RUN --mount=type=cache,target=/root/.cache/uv,sharing=locked \
    uv pip install --python /opt/venv/bin/python .

# --- Stage 2: runtime (small) ---
FROM python:3.11-slim
ENV DEBIAN_FRONTEND=noninteractive \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PATH="/opt/venv/bin:$PATH"

WORKDIR /app

# Only runtime OS deps
RUN --mount=type=cache,target=/var/cache/apt,sharing=locked \
    --mount=type=cache,target=/var/lib/apt,sharing=locked \
    apt-get update && apt-get install -y --no-install-recommends \
    stockfish libgomp1 \
    && ln -sf /usr/games/stockfish /usr/local/bin/stockfish \
    && rm -rf /var/lib/apt/lists/*

COPY --from=builder /opt/venv /opt/venv
COPY app ./app

EXPOSE 8000
# Production command (no autoreload). Set UVICORN_WORKERS at runtime if needed.
ENV UVICORN_WORKERS=1
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers ${UVICORN_WORKERS}"]