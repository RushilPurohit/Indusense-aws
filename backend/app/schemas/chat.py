from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class Citation(BaseModel):
    id: str
    chunk_id: str
    document_id: str
    page_num: int
    text_snippet: str
    confidence: float

class Evidence(BaseModel):
    citations: List[Citation]
    reasoning: str

class QueryRequest(BaseModel):
    query: str
    document_ids: Optional[List[str]] = []
    sensor_data: Optional[Dict[str, Any]] = None

class QueryResponse(BaseModel):
    answer: str
    summary: str
    likely_causes: List[str]
    recommended_checks: List[str]
    step_by_step_action: List[str]
    machine_insight: str
    confidence: float
    citations: List[Citation]

class MultiDocumentRequest(BaseModel):
    query: str
    document_ids: List[str]

class MultiDocumentResponse(BaseModel):
    answer: str
    cross_references: List[str]
    citations: List[Citation]
