class MultimodalPipeline:
    def process_multimodal_query(self, query: str, doc_ids: list, sensor_data: dict, image: bytes = None):
        return {
            "query": query,
            "answer": "Generated multimodal answer.",
            "citations": [],
            "sensor_insights": "Sensors normal."
        }

multimodal_pipeline = MultimodalPipeline()
