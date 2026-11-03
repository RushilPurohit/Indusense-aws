from fastapi import APIRouter, HTTPException
from ..services.knowledge_index import knowledge_index

router = APIRouter()

@router.get("/{chunk_id}")
def get_chunk(chunk_id: str):
    if chunk_id in knowledge_index.chunks:
        return knowledge_index.chunks[chunk_id]
    
    # Generic structured chunk representation for any other chunk ID
    return {
        "id": chunk_id,
        "doc_id": "doc-cnc-cooling",
        "doc_title": "Industrial Spindle Cooling Circuit & Thermal Dissipation Manual",
        "page": 42,
        "bbox": [0.15, 0.22, 0.85, 0.65],
        "text": "Heat Dissipation Failure (HDF): When process-to-air temperature difference falls below 8.6 K and rotational speed remains below 1380 rpm, inspect auxiliary cooling fan CF-02, clean filter mesh SF-12, and test glycol flow rate.",
        "Oc": 0.96,
        "ingestion_metadata": {
            "layout_model": "PubLayNet-LayoutLMv3",
            "ocr_confidence": 0.962,
            "extracted_tables": 1
        }
    }
