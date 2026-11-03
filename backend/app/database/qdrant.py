try:
    from qdrant_client import QdrantClient
    from qdrant_client.http import models
    QDRANT_AVAILABLE = True
except ImportError:
    QDRANT_AVAILABLE = False
    QdrantClient = None
    models = None

from ..core.config import settings
from ..core.logging import get_logger

logger = get_logger(__name__)

class QdrantManager:
    def __init__(self):
        if QDRANT_AVAILABLE:
            try:
                self.client = QdrantClient(host=settings.QDRANT_HOST, port=settings.QDRANT_PORT)
                self.fallback = False
            except Exception as e:
                logger.warning(f"Failed to connect to Qdrant, using fallback: {e}")
                self.fallback = True
                self.memory_store = {}
        else:
            logger.warning("qdrant_client library not installed, using in-memory fallback store")
            self.fallback = True
            self.memory_store = {}

    def initialize_collections(self):
        if self.fallback: return
        collections = ["text_chunks", "table_chunks", "document_embeddings"]
        for col in collections:
            try:
                self.client.get_collection(col)
            except Exception:
                self.client.create_collection(
                    collection_name=col,
                    vectors_config=models.VectorParams(size=768, distance=models.Distance.COSINE)
                )

    def upsert_chunks(self, chunks, collection="text_chunks"):
        if self.fallback:
            if collection not in self.memory_store:
                self.memory_store[collection] = []
            self.memory_store[collection].extend(chunks)
            return
        
        points = [
            models.PointStruct(id=c["id"], vector=c["vector"], payload=c["payload"])
            for c in chunks
        ]
        self.client.upsert(collection_name=collection, points=points)

    def search_similar(self, query_vector, collection="text_chunks", top_k=5, filter_dict=None):
        if self.fallback:
            # Dummy fallback search
            return self.memory_store.get(collection, [])[:top_k]
        
        query_filter = None
        if filter_dict:
            must_conditions = [
                models.FieldCondition(key=k, match=models.MatchValue(value=v))
                for k, v in filter_dict.items()
            ]
            query_filter = models.Filter(must=must_conditions)
            
        return self.client.search(
            collection_name=collection,
            query_vector=query_vector,
            query_filter=query_filter,
            limit=top_k
        )

qdrant_manager = QdrantManager()
