from sentence_transformers import CrossEncoder
from ..core.config import settings

class RerankingService:
    def __init__(self):
        self._model = None

    @property
    def model(self):
        if self._model is None:
            self._model = CrossEncoder(settings.RERANKER_MODEL)
        return self._model

    def rerank(self, query: str, candidates: list) -> list:
        if not candidates:
            return []
        texts = [c.get("text", "") for c in candidates]
        scores = self.model.predict([(query, t) for t in texts])
        for i, score in enumerate(scores):
            candidates[i]["score"] = score
        candidates.sort(key=lambda x: x["score"], reverse=True)
        return candidates

reranking_service = RerankingService()
