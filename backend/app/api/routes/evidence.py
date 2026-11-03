from fastapi import APIRouter

router = APIRouter()

@router.get("/{citation_id}")
async def get_evidence(citation_id: str):
    return {"citation_id": citation_id, "text": "Mock evidence text"}

@router.get("/{doc_id}/page/{page_num}")
async def get_page_evidence(doc_id: str, page_num: int):
    return {"doc_id": doc_id, "page_num": page_num, "content": "Mock page content"}

@router.get("/{doc_id}/highlight")
async def get_highlights(doc_id: str):
    return {"doc_id": doc_id, "bboxes": []}
