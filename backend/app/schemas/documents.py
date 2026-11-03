from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class DocumentUploadResponse(BaseModel):
    doc_id: str
    filename: str
    status: str
    message: str

class DocumentStatus(BaseModel):
    doc_id: str
    filename: str
    file_type: str
    size: int
    uploaded_at: str
    status: str # uploaded, processing, ready, failed
    current_step: str
    progress: float
    page_count: int
    chunk_count: int
    table_count: int
    figure_count: int
    error: Optional[str] = None

class PageSchema(BaseModel):
    id: str
    document_id: str
    page_num: int
    text_content: str

class ChunkSchema(BaseModel):
    id: str
    document_id: str
    page_num: int
    text: str

class ProcessingStatus(BaseModel):
    doc_id: str
    step: str
    status: str
    progress: float
    page_count: int = 0
    chunk_count: int = 0
    table_count: int = 0
    figure_count: int = 0
    error: Optional[str] = None
