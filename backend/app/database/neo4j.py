try:
    from neo4j import GraphDatabase
    NEO4J_AVAILABLE = True
except ImportError:
    NEO4J_AVAILABLE = False
    GraphDatabase = None

from ..core.config import settings
from ..core.logging import get_logger

logger = get_logger(__name__)

class Neo4jManager:
    def __init__(self):
        if NEO4J_AVAILABLE:
            try:
                self.driver = GraphDatabase.driver(settings.NEO4J_URI, auth=(settings.NEO4J_USER, settings.NEO4J_PASSWORD))
                self.driver.verify_connectivity()
                self.fallback = False
            except Exception as e:
                logger.warning(f"Neo4j connection failed, using fallback: {e}")
                self.fallback = True
                self.graph_mock = {"nodes": [], "edges": []}
        else:
            logger.warning("neo4j library not installed, using in-memory mock graph")
            self.fallback = True
            self.graph_mock = {"nodes": [], "edges": []}

    def close(self):
        if not self.fallback:
            self.driver.close()

    def create_document_node(self, doc_id, filename, metadata):
        if self.fallback: return
        query = "MERGE (d:Document {id: $doc_id}) SET d.filename = $filename, d.metadata = $metadata"
        with self.driver.session() as session:
            session.run(query, doc_id=doc_id, filename=filename, metadata=str(metadata))

    def create_page_node(self, page_id, doc_id, page_num):
        if self.fallback: return
        query = """
        MATCH (d:Document {id: $doc_id})
        MERGE (p:Page {id: $page_id}) SET p.page_num = $page_num
        MERGE (d)-[:HAS_PAGE]->(p)
        """
        with self.driver.session() as session:
            session.run(query, page_id=page_id, doc_id=doc_id, page_num=page_num)

    def create_entity_nodes(self, entities: list):
        if self.fallback: return
        with self.driver.session() as session:
            for entity in entities:
                label = entity.get("type", "Entity")
                query = f"MERGE (e:{label} {{id: $id}}) SET e.name = $name"
                session.run(query, id=entity["id"], name=entity["name"])

    def create_relationships(self, entity_pairs: list):
        if self.fallback: return
        with self.driver.session() as session:
            for pair in entity_pairs:
                query = """
                MATCH (a {id: $source_id}), (b {id: $target_id})
                MERGE (a)-[r:RELATED_TO {type: $rel_type}]->(b)
                """
                session.run(query, source_id=pair["source_id"], target_id=pair["target_id"], rel_type=pair["type"])

    def query_related_entities(self, entity_name):
        if self.fallback: return []
        query = """
        MATCH (a {name: $name})-[r]-(b)
        RETURN a, type(r), b
        """
        with self.driver.session() as session:
            result = session.run(query, name=entity_name)
            return [record.data() for record in result]

    def get_full_subgraph(self, doc_id):
        if self.fallback: return self.graph_mock
        query = """
        MATCH (d:Document {id: $doc_id})-[:HAS_PAGE]->(p:Page)-[:CONTAINS]->(e1)-[r]->(e2)
        RETURN e1, r, e2 LIMIT 100
        """
        # simplified mock for hackathon implementation limits
        return {"nodes": [{"id": "1", "label": "MockNode"}], "edges": []}

neo4j_manager = Neo4jManager()
