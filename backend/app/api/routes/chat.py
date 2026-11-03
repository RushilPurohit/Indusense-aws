from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from ...services.rag_service import rag_service

router = APIRouter()

class ChatQueryRequest(BaseModel):
    query: str
    document_ids: Optional[List[str]] = None
    sensor_data: Optional[Dict[str, Any]] = None

@router.post("/query")
async def process_chat_query(req: ChatQueryRequest):
    if not req.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty")
        
    res = await rag_service.answer_query(
        query=req.query,
        document_ids=req.document_ids,
        sensor_data=req.sensor_data
    )
    return res

@router.post("/multidocument")
async def process_multidocument_query(req: ChatQueryRequest):
    return await process_chat_query(req)

@router.get("/history")
async def get_chat_history():
    return []

@router.delete("/history")
async def clear_chat_history():
    return {"message": "Chat history cleared"}
