from PIL import Image

class DiagramService:
    def detect_diagrams(self, image: Image.Image, layout_regions: list) -> list:
        return []

    def caption_diagram(self, diagram_image: Image.Image) -> str:
        return "A diagram showing technical components."

diagram_service = DiagramService()
