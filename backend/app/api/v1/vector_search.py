# backend/app/routers/vector_search.py
"""
This module provides a FastAPI router for vector search functionality within the RAG (Retrieval-Augmented Generation) pipeline.
It enables similarity search over chess openings embeddings stored in a Milvus vector database.
"""

import os
from typing import List, Dict, Any
from fastapi import APIRouter, HTTPException, Query
from sentence_transformers import SentenceTransformer
from pymilvus import connections, Collection

MILVUS_HOST = os.getenv("MILVUS_HOST", "milvus")
MILVUS_PORT = os.getenv("MILVUS_PORT", "19530")
COLLECTION_NAME = os.getenv("MILVUS_COLLECTION", "wikichess_openings")
EMB_MODEL = os.getenv("EMB_MODEL", "sentence-transformers/all-MiniLM-L6-v2")

router = APIRouter(prefix="/api/v1", tags=["RAG"])

_model = SentenceTransformer(EMB_MODEL)

def _connect():
    """
    Establish a connection to the Milvus vector database using the configured host and port.
    Raises an exception if the connection fails.
    """
    connections.connect(alias="default", host=MILVUS_HOST, port=MILVUS_PORT)

def _collection() -> Collection:
    """
    Retrieve the Milvus collection instance for the configured collection name.
    
    Returns:
        Collection: The Milvus collection object representing the vector database collection.
    """
    return Collection(COLLECTION_NAME)

@router.get("/vector-search")
def vector_search(q: str = Query(..., description="Name of the chess opening or query string"), top_k: int = 3):
    """
    Perform a vector similarity search on chess openings embeddings stored in Milvus.
    
    Parameters:
        q (str): Query string representing the name of a chess opening or a related question.
        top_k (int): Number of top similar results to return (default is 3).
    
    Returns:
        dict: A dictionary containing the original query and a list of search results with openings,
              associated text, and similarity scores.
    
    Raises:
        HTTPException: 500 if connection or search fails, 404 if no relevant results are found.
    """
    try:
        _connect()
        col = _collection()
    except Exception as e:
        raise HTTPException(500, f"Unable to connect to Milvus: {e}")

    emb = _model.encode([q], normalize_embeddings=True)
    search_params = {"metric_type": "COSINE", "params": {"nprobe": 16}}

    try:
        results = col.search(
            data=emb,
            anns_field="embedding",
            param=search_params,
            limit=top_k,
            output_fields=["opening", "text"],
        )
    except Exception as e:
        raise HTTPException(500, f"Vector search failed: {e}")

    hits = []
    for hit in results[0]:
        hits.append({
            "opening": hit.entity.get("opening"),
            "text": hit.entity.get("text"),
            "score": float(hit.distance),
        })

    if not hits:
        raise HTTPException(404, "No relevant results found")

    # Simple response format; can be extended with LangGraph for richer output
    return {
        "query": q,
        "results": hits,
    }