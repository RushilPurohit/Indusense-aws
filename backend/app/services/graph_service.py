from ..database.neo4j import neo4j_manager

class GraphService:
    def build_graph_from_document(self, doc_id: str, chunks: list, entities: list):
        neo4j_manager.create_entity_nodes(entities)
        # Mock relationships
        rels = [{"source_id": entities[0]["id"], "target_id": entities[1]["id"], "type": "RELATES_TO"}] if len(entities) > 1 else []
        neo4j_manager.create_relationships(rels)

    def extract_entities_from_text(self, text: str) -> list:
        # Mock Gemini NER
        return [{"id": "e1", "name": "Motor", "type": "Component"}]

    def get_knowledge_graph(self, doc_id: str) -> dict:
        return neo4j_manager.get_full_subgraph(doc_id)

    def query_graph_for_context(self, query: str) -> list:
        return neo4j_manager.query_related_entities(query)

graph_service = GraphService()
