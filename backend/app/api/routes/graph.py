from fastapi import APIRouter
from ...schemas.graph import GraphResponse
from ...services.graph_service import graph_service

router = APIRouter()

@router.get("/{doc_id}", response_model=GraphResponse)
async def get_full_graph(doc_id: str):
    graph = graph_service.get_knowledge_graph(doc_id)
    return GraphResponse(nodes=graph["nodes"], edges=graph["edges"])

@router.get("/entity/{entity_id}")
async def get_entity(entity_id: str):
    return {"id": entity_id, "name": "MockEntity"}

@router.post("/query")
async def query_graph(query: dict):
    return graph_service.query_graph_for_context(query.get("query", ""))
