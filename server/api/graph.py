from fastapi import APIRouter
from ..services.knowledge_index import knowledge_index

router = APIRouter()

@router.get("")
def get_graph():
    return knowledge_index.graph
