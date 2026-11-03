from fastapi import APIRouter, UploadFile, File, BackgroundTasks, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import uuid
import os
import inspect
from pathlib import Path
from datetime import datetime
from ...database.postgres import get_db, Document
from ...schemas.documents import DocumentUploadResponse, DocumentStatus
from ...pipelines.document_pipeline import document_pipeline

router = APIRouter()
UPLOAD_DIR = Path("documents/uploaded")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

async def safe_commit(db):
    if hasattr(db, 'commit'):
        res = db.commit()
        if inspect.isawaitable(res):
            await res

def doc_to_status_schema(doc: Document) -> DocumentStatus:
    return DocumentStatus(
        doc_id=doc.id,
        filename=doc.filename,
        file_type=doc.file_type or "PDF",
        size=doc.size or 0,
        uploaded_at=doc.uploaded_at.strftime("%Y-%m-%d %H:%M") if doc.uploaded_at else "",
        status=doc.status or "ready",
        current_step=doc.current_step or "Completed",
        progress=doc.progress if doc.progress is not None else 100.0,
        page_count=doc.page_count or 0,
        chunk_count=doc.chunk_count or 0,
        table_count=doc.table_count or 0,
        figure_count=doc.figure_count or 0,
        error=doc.error
    )

@router.post("/upload", response_model=DocumentUploadResponse)
async def upload_document(background_tasks: BackgroundTasks, file: UploadFile = File(...), db=Depends(get_db)):
    doc_id = str(uuid.uuid4())
    ext = Path(file.filename).suffix.upper().replace('.', '') or "PDF"
    file_path = UPLOAD_DIR / f"{doc_id}_{file.filename}"
    
    # Save file
    file_size = 0
    with open(file_path, "wb") as buffer:
        content = await file.read()
        file_size = len(content)
        buffer.write(content)
        
    new_doc = Document(
        id=doc_id,
        filename=file.filename,
        file_path=str(file_path),
        file_type=ext,
        size=file_size,
        uploaded_at=datetime.utcnow(),
        status="processing",
        current_step="File uploaded",
        progress=10.0,
        page_count=0,
        chunk_count=0,
        table_count=0,
        figure_count=0
    )
    
    if hasattr(db, 'add'):
        db.add(new_doc)
        await safe_commit(db)
            
    # Add background processing task (independent session created inside process_document)
    background_tasks.add_task(document_pipeline.process_document, doc_id, file_path)
    
    return DocumentUploadResponse(
        doc_id=doc_id,
        filename=file.filename,
        status="processing",
        message="Upload successful, document processing started."
    )

@router.get("/", response_model=list[DocumentStatus])
async def list_documents(db=Depends(get_db)):
    try:
        # Check if async
        if hasattr(db, 'execute') and inspect.iscoroutinefunction(db.execute):
            res = await db.execute(select(Document).order_by(Document.uploaded_at.desc()))
            docs = res.scalars().all()
            return [doc_to_status_schema(d) for d in docs]
        else:
            docs = db.query(Document).order_by(Document.uploaded_at.desc()).all()
            return [doc_to_status_schema(d) for d in docs]
    except Exception:
        try:
            docs = db.query(Document).order_by(Document.uploaded_at.desc()).all()
            return [doc_to_status_schema(d) for d in docs]
        except Exception:
            return []

@router.get("/{id}/status", response_model=DocumentStatus)
async def get_document_status(id: str, db=Depends(get_db)):
    try:
        if hasattr(db, 'execute') and inspect.iscoroutinefunction(db.execute):
            res = await db.execute(select(Document).where(Document.id == id))
            doc = res.scalar_one_or_none()
        else:
            doc = db.query(Document).filter(Document.id == id).first()
            
        if not doc:
            raise HTTPException(status_code=404, detail="Document not found")
        return doc_to_status_schema(doc)
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=404, detail="Document not found")

@router.get("/{id}", response_model=DocumentStatus)
async def get_document(id: str, db=Depends(get_db)):
    return await get_document_status(id, db)

@router.delete("/{id}")
async def delete_document(id: str, db=Depends(get_db)):
    try:
        if hasattr(db, 'execute') and inspect.iscoroutinefunction(db.execute):
            res = await db.execute(select(Document).where(Document.id == id))
            doc = res.scalar_one_or_none()
        else:
            doc = db.query(Document).filter(Document.id == id).first()
            
        if doc:
            if doc.file_path and os.path.exists(doc.file_path):
                try: os.remove(doc.file_path)
                except Exception: pass
            if hasattr(db, 'delete'):
                if inspect.iscoroutinefunction(db.delete):
                    await db.delete(doc)
                else:
                    db.delete(doc)
            await safe_commit(db)
            return {"message": "Document deleted successfully"}
        raise HTTPException(status_code=404, detail="Document not found")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
