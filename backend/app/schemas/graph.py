from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class GraphNode(BaseModel):
    id: str
    label: str
    properties: Dict[str, Any]

class GraphEdge(BaseModel):
    source: str
    target: str
    type: str
    properties: Dict[str, Any]

class GraphResponse(BaseModel):
    nodes: List[GraphNode]
    edges: List[GraphEdge]

class EntityRelationship(BaseModel):
    source_entity: str
    target_entity: str
    relationship_type: str
    context: str
