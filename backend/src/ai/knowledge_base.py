from typing import List, Optional

import chromadb
from chromadb.config import Settings as ChromaSettings

from ..core.config import get_settings

settings = get_settings()

_chroma_client: Optional[chromadb.PersistentClient] = None


def get_chroma_client() -> chromadb.PersistentClient:
    global _chroma_client
    if _chroma_client is None:
        _chroma_client = chromadb.PersistentClient(path=settings.chroma_persist_dir, settings=ChromaSettings(anonymized_telemetry=False))
    return _chroma_client


def get_faq_collection():
    client = get_chroma_client()
    return client.get_or_create_collection(name="faq_knowledge")


def add_documents(collection, texts: List[str], metadatas: Optional[List[dict]] = None, ids: Optional[List[str]] = None) -> None:
    ids = ids or [str(i) for i in range(len(texts))]
    collection.add(documents=texts, metadatas=metadatas or [{}] * len(texts), ids=ids)


def search(collection, query: str, n_results: int = 5) -> List[str]:
    results = collection.query(query_texts=[query], n_results=n_results)
    return results["documents"][0] if results["documents"] else []
