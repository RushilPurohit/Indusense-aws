from ..database.qdrant import qdrant_manager
from ..database.neo4j import neo4j_manager
from .embedding_service import embedding_service

class RetrievalService:
    def retrieve(self, query: str, document_ids: list, top_k: int) -> list:
        query_vector = embedding_service.embed_query(query).tolist()
        filter_dict = {"document_id": document_ids} if document_ids else None
        return qdrant_manager.search_similar(query_vector, filter_dict=filter_dict, top_k=top_k)

    def keyword_search(self, query: str, document_ids: list) -> list:
        return []

    def graph_search(self, query: str) -> list:
        return neo4j_manager.query_related_entities(query)

    def merge_results(self, vector_results, keyword_results, graph_results) -> list:
        return vector_results + keyword_results + graph_results

retrieval_service = RetrievalService()
