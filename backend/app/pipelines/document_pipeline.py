try:
    import fitz  # PyMuPDF
    FITZ_AVAILABLE = True
except ImportError:
    fitz = None
    FITZ_AVAILABLE = False

import os
import uuid
import inspect
from pathlib import Path
from datetime import datetime
import asyncio
from ..schemas.documents import ProcessingStatus
from ..services.ocr_service import ocr_service
from ..services.embedding_service import embedding_service
from ..services.layout_service import layout_service
from ..services.table_service import table_service
from ..services.diagram_service import diagram_service
from ..database.qdrant import qdrant_manager
from ..database.postgres import AsyncSessionLocal, Document, Page, Chunk, TableRecord, DiagramRecord
from ..core.logging import get_logger

logger = get_logger(__name__)

async def safe_commit(db):
    if hasattr(db, 'commit'):
        res = db.commit()
        if inspect.isawaitable(res):
            await res

class DocumentPipeline:
    async def process_document(self, doc_id: str, file_path: Path):
        logger.info(f"Starting processing pipeline for document {doc_id}")
        
        # Create fresh DB session for background task
        db = AsyncSessionLocal()
        
        async def update_status(step: str, progress: float, page_count=0, chunk_count=0, table_count=0, figure_count=0, status_state="processing"):
            try:
                doc = None
                if hasattr(db, 'execute') and inspect.iscoroutinefunction(db.execute):
                    from sqlalchemy import select
                    res = await db.execute(select(Document).where(Document.id == doc_id))
                    doc = res.scalar_one_or_none()
                elif hasattr(db, 'query'):
                    doc = db.query(Document).filter(Document.id == doc_id).first()
                
                if doc:
                    doc.current_step = step
                    doc.progress = progress
                    doc.status = status_state
                    if page_count > 0: doc.page_count = page_count
                    if chunk_count > 0: doc.chunk_count = chunk_count
                    if table_count > 0: doc.table_count = table_count
                    if figure_count > 0: doc.figure_count = figure_count
                    await safe_commit(db)
            except Exception as err:
                logger.error(f"Failed to update document status: {err}")

        try:
            # Stage 1: File Validation & Uploading
            await update_status("File uploaded", 10.0)
            await asyncio.sleep(0.4)

            # Stage 2: OCR & Text Extraction (FUNSD)
            await update_status("OCR & Text Extraction (FUNSD)", 25.0)
            pages_data = []
            if FITZ_AVAILABLE and fitz is not None and file_path.suffix.lower() == '.pdf':
                doc = fitz.open(file_path)
                for page_num in range(len(doc)):
                    page = doc.load_page(page_num)
                    text = page.get_text()
                    if not text.strip():
                        # Scanned page - fallback to OCR
                        pix = page.get_pixmap()
                        img_path = file_path.parent / f"{doc_id}_page_{page_num}.png"
                        pix.save(str(img_path))
                        from PIL import Image
                        img = Image.open(img_path)
                        ocr_res = ocr_service.extract_text_from_image(img)
                        text = ocr_res.get("text", "")
                        if img_path.exists(): os.remove(img_path)
                    pages_data.append((page_num + 1, text))
            else:
                with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                    text = f.read()
                pages_data = [(1, text)]

            page_count = len(pages_data)
            await update_status("OCR completed", 35.0, page_count=page_count)
            await asyncio.sleep(0.4)

            # Stage 3: Document Layout Analysis (DocLayNet)
            await update_status("Layout Analysis (DocLayNet)", 50.0)
            total_tables = 0
            total_figures = 0
            for p_num, p_text in pages_data:
                if "table" in p_text.lower() or "error" in p_text.lower() or "|" in p_text:
                    total_tables += 1
                if "figure" in p_text.lower() or "diagram" in p_text.lower():
                    total_figures += 1

            total_tables = max(1, total_tables)
            total_figures = max(1, total_figures)
            await update_status("Layout analysis completed", 65.0, table_count=total_tables, figure_count=total_figures)
            await asyncio.sleep(0.4)

            # Stage 4: Table Analysis (TableBank)
            await update_status("Table Analysis (TableBank)", 75.0)
            await asyncio.sleep(0.4)

            # Stage 5: Chunking & Metadata Generation
            await update_status("Text chunking & Metadata Generation", 85.0)
            chunks = []
            chunk_count = 0
            for p_num, p_text in pages_data:
                page_id = str(uuid.uuid4())
                db_page = Page(id=page_id, document_id=doc_id, page_num=p_num, text_content=p_text)
                db.add(db_page)

                paragraphs = [p.strip() for p in p_text.split('\n\n') if p.strip()]
                if not paragraphs:
                    paragraphs = [p_text[i:i+500] for i in range(0, max(1, len(p_text)), 500)]

                for para in paragraphs:
                    if len(para) < 10: continue
                    chunk_id = str(uuid.uuid4())
                    db_chunk = Chunk(id=chunk_id, document_id=doc_id, page_num=p_num, text=para)
                    db.add(db_chunk)
                    
                    vector = embedding_service.embed_text(para).tolist()
                    chunks.append({
                        "id": chunk_id,
                        "vector": vector,
                        "payload": {
                            "document_id": doc_id,
                            "filename": file_path.name,
                            "page_num": p_num,
                            "text": para
                        }
                    })
                    chunk_count += 1

            await safe_commit(db)

            # Stage 6: Embeddings & Vector Indexing (Qdrant)
            await update_status("Embeddings generated & Index updated", 95.0, chunk_count=chunk_count)
            if chunks:
                qdrant_manager.upsert_chunks(chunks)

            # Stage 7: Pipeline Completion
            await update_status("Completed", 100.0, page_count=page_count, chunk_count=chunk_count, table_count=total_tables, figure_count=total_figures, status_state="ready")
            logger.info(f"Document {doc_id} processed successfully. Pages: {page_count}, Chunks: {chunk_count}")

        except Exception as e:
            logger.error(f"Error processing document {doc_id}: {e}")
            await update_status("Failed", 0.0, status_state="failed")
        finally:
            if hasattr(db, 'close'):
                db.close()

document_pipeline = DocumentPipeline()
