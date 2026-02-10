from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from app.api.v1.routes_chess import router as chess_router
from app.api.v1.vector_search import router as vector_search
from app.api.v1.youtube_videos import router as youtube_videos


# -------------------------------------------------
# Application initialization
# -------------------------------------------------

app = FastAPI(
    title="Chess Agent API",
    version="0.1.0",
    description="FastAPI backend for the Chess Agent project (RAG + LLM + chess logic with Lichess and Stockfish)",
)

# -------------------------------------------------
# Middleware configuration
# -------------------------------------------------

# CORS configuration

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------------------------------
# API routes
# -------------------------------------------------

@app.get("/api/v1/healthcheck", tags=["System"])
async def healthcheck():
    """
    Basic health check endpoint to verify that the container is running.
    Returns the service status and the current environment mode.
    """
    environment = os.getenv("ENVIRONMENT", "development")
    return {"status": "ok", "environment": environment}


@app.get("/api/v1/info", tags=["System"])
async def info():
    """
    Provides metadata about the Chess Agent backend.
    """
    return {
        "project": "Chess Agent",
        "version": "0.1.0",
        "description": "FastAPI backend for RAG + LLM services",
    }

app.include_router(chess_router)
app.include_router(vector_search)
app.include_router(youtube_videos)

# -------------------------------------------------
# Local debug entry point
# -------------------------------------------------

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)