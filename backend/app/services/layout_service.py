from PIL import Image
from ..core.logging import get_logger

logger = get_logger(__name__)

class LayoutService:
    def __init__(self):
        self.fallback = True

    def detect_layout(self, image: Image.Image) -> list:
        # Mock bounding boxes and labels for layout detection
        return [{"box": [0, 0, image.width, image.height], "label": "TextRegion"}]

    def classify_document_structure(self, regions: list) -> str:
        return "Manual"

layout_service = LayoutService()
