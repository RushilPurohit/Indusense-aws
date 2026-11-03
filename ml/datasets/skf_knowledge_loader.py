"""
SKF Bearing Handbook & Industrial Knowledge Loader
Extracts grounded technical knowledge from:
1. SKF Bearing Damage and Failure Analysis (2025) PDF (106 pages)
2. Paderborn Bearing Damage Fact Sheets
3. Factory Sensors Historical Work Orders
"""

from pathlib import Path
from typing import List, Dict, Any
import pypdf
import pandas as pd

from .config import SKF_PDF_PATH, PADERBORN_DIR, FACTORY_DIR

def extract_skf_pdf_chunks(pdf_path: Path = SKF_PDF_PATH, max_pages: int = 106) -> List[Dict[str, Any]]:
    if not pdf_path.exists():
        return []

    reader = pypdf.PdfReader(str(pdf_path))
    chunks = []
    
    current_chapter = "General Bearing Guidelines"
    
    for page_idx in range(min(len(reader.pages), max_pages)):
        page_num = page_idx + 1
        text = reader.pages[page_idx].extract_text() or ""
        text = text.strip()
        if not text:
            continue

        # Detect chapter or section headers
        for line in text.splitlines()[:5]:
            line_str = line.strip()
            if line_str.startswith(("1 ", "2 ", "3 ", "4 ", "5 ", "6 ", "7 ")):
                current_chapter = line_str

        # Create paragraph chunks (around 300-600 characters)
        paragraphs = [p.strip() for p in text.split("\n\n") if len(p.strip()) > 80]
        if not paragraphs:
            paragraphs = [text[:800]]

        for sub_idx, para in enumerate(paragraphs):
            chunk_id = f"skf-p{page_num}-c{sub_idx+1}"
            chunks.append({
                "id": chunk_id,
                "doc_id": "skf-handbook-2025",
                "doc_title": "SKF Bearing Damage and Failure Analysis (2025)",
                "source_type": "OEM Technical Manual",
                "domain": "bearing",
                "page_number": page_num,
                "section": current_chapter,
                "text": para,
                "component": "Rolling Element Bearing",
                "is_synthetic": False
            })

    return chunks

def extract_work_order_evidence(factory_dir: Path = FACTORY_DIR) -> List[Dict[str, Any]]:
    wo_path = factory_dir / "work_orders.csv"
    if not wo_path.exists():
        return []

    df_wo = pd.read_csv(wo_path)
    chunks = []
    for _, row in df_wo.iterrows():
        wo_id = str(row['work_order_id'])
        asset_id = str(row['asset_id'])
        order_type = str(row.get('order_type', 'Corrective'))
        priority = str(row.get('priority', 'Medium'))
        labor_hours = row.get('labor_hours', 'N/A')
        parts_cost = row.get('parts_cost', 'N/A')
        
        text = (
            f"Historical Work Order {wo_id} for Asset {asset_id}. "
            f"Order Type: {order_type}, Priority: {priority}, Labor: {labor_hours} hrs, Cost: ${parts_cost}. "
            f"Note: Work order represents historical maintenance record; verify with equipment manual before execution."
        )
        chunks.append({
            "id": f"wo-{wo_id}",
            "doc_id": "factory-work-orders-log",
            "doc_title": "Plant Asset Work Orders & Historical Interventions",
            "source_type": "Historical Work Order",
            "domain": "pump",
            "page_number": 1,
            "section": f"Asset {asset_id} Maintenance Log",
            "text": text,
            "component": "Industrial Pump Subsystem",
            "is_synthetic": True
        })
    return chunks

