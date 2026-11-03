from PIL import Image
from ..core.logging import get_logger

logger = get_logger(__name__)

class TableService:
    def __init__(self):
        self.fallback = True

    def detect_tables(self, image: Image.Image) -> list:
        return []

    def extract_table(self, table_image: Image.Image) -> dict:
        return {"rows": [], "columns": [], "cells": []}

    def table_to_markdown(self, table_dict: dict) -> str:
        return "| Mock Table |\n|---|---|\n| Data | Data |"

    def table_to_json(self, table_dict: dict, source_page: int, source_doc: str) -> dict:
        return {"doc_id": source_doc, "page": source_page, "table": table_dict}

table_service = TableService()
