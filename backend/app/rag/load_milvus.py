# backend/app/rag/load_milvus.py
import os
from typing import List, Dict
import numpy as np
from sentence_transformers import SentenceTransformer
from pymilvus import (
    connections, FieldSchema, CollectionSchema, DataType, Collection, utility
)

from .data_wikichess.en import DATA_EN

COLLECTION_NAME = os.getenv("MILVUS_COLLECTION", "wikichess_openings")
MILVUS_HOST = os.getenv("MILVUS_HOST", "milvus")
MILVUS_PORT = os.getenv("MILVUS_PORT", "19530")

# Small, fast model (384 dims). You can switch to Qwen later if needed.
EMB_MODEL = os.getenv("EMB_MODEL", "sentence-transformers/all-MiniLM-L6-v2")
model = SentenceTransformer(EMB_MODEL)
EMB_DIM = model.get_sentence_embedding_dimension()

def connect():
    connections.connect(alias="default", host=MILVUS_HOST, port=MILVUS_PORT)

def ensure_collection() -> Collection:
    if utility.has_collection(COLLECTION_NAME):
        return Collection(COLLECTION_NAME)

    fields = [
        FieldSchema(name="id", dtype=DataType.INT64, is_primary=True, auto_id=True),
        FieldSchema(name="opening", dtype=DataType.VARCHAR, max_length=64),
        FieldSchema(name="text", dtype=DataType.VARCHAR, max_length=4096),
        FieldSchema(name="embedding", dtype=DataType.FLOAT_VECTOR, dim=EMB_DIM),
    ]
    schema = CollectionSchema(fields, description="Wikichess openings")
    col = Collection(name=COLLECTION_NAME, schema=schema)

    # Vector search index
    index_params = {
        "index_type": "IVF_FLAT",
        "metric_type": "COSINE",
        "params": {"nlist": 1024},
    }
    col.create_index(field_name="embedding", index_params=index_params)
    col.load()
    return col

def chunk_text(text: str, max_chars: int = 500) -> List[str]:
    # Simple chunking into ~500-character blocks
    chunks, buf = [], []
    length = 0
    for sent in text.split(". "):
        if length + len(sent) > max_chars and buf:
            chunks.append(". ".join(buf).strip())
            buf, length = [], 0
        buf.append(sent)
        length += len(sent)
    if buf:
        chunks.append(". ".join(buf).strip())
    return chunks

def embed_texts(texts: List[str]) -> np.ndarray:
    embs = model.encode(texts, normalize_embeddings=True, show_progress_bar=False)
    return np.asarray(embs, dtype=np.float32)

def load_data():
    connect()
    col = ensure_collection()

    rows_opening, rows_text, rows_emb = [], [], []

    for item in DATA_EN:
        opening = item["opening"]
        for c in chunk_text(item["text"]):
            rows_opening.append(opening)
            rows_text.append(c)

    rows_emb = embed_texts(rows_text)

    # insertion
    entities = [
        rows_opening,
        rows_text,
        rows_emb,
    ]
    insert_result = col.insert(entities)
    col.flush()
    col.load()
    print(f"Inserted {len(rows_text)} chunks into '{COLLECTION_NAME}'. IDs: {insert_result.primary_keys[:5]} ...")

if __name__ == "__main__":
    load_data()
