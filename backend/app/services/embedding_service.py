import numpy as np
from sentence_transformers import SentenceTransformer
from ..core.config import settings

class EmbeddingService:
    def __init__(self):
        self._model = None

    @property
    def model(self):
        if self._model is None:
            self._model = SentenceTransformer(settings.EMBEDDING_MODEL)
        return self._model

    def embed_text(self, text: str) -> np.ndarray:
        return self.model.encode(text, normalize_embeddings=True)

    def embed_batch(self, texts: list) -> np.ndarray:
        return self.model.encode(texts, normalize_embeddings=True)

    def embed_query(self, query: str) -> np.ndarray:
        # BGE models use specific prefix for queries
        instruction = "Represent this sentence for searching relevant passages: "
        if "bge" in settings.EMBEDDING_MODEL.lower():
            query = instruction + query
        return self.embed_text(query)

embedding_service = EmbeddingService()
