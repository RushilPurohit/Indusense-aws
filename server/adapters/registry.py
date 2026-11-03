"""
InduSense Adapters Registry
Every adapter exposes an explicit status: configured | mock | not_configured
"""

class CloudAdaptersRegistry:
    @staticmethod
    def get_services_status():
        return [
            {
                "service": "Storage (S3)",
                "role": "Document and telemetry blob vault",
                "mode": "mock",
                "details": "Local disk filesystem adapter active (./uploads and ./data). AWS S3 credentials unconfigured."
            },
            {
                "service": "OCR Engine (Textract)",
                "role": "Document layout and table parsing",
                "mode": "mock",
                "details": "Local PyPDF & layout chunker active. AWS Textract adapter mocked."
            },
            {
                "service": "Inference (SageMaker)",
                "role": "Predictor heads hosting (AI4I, C-MAPSS, FEMTO)",
                "mode": "mock",
                "details": "Local Scikit-Learn & deterministic demo adapter active. SageMaker endpoint unconfigured."
            },
            {
                "service": "Vector Index (OpenSearch)",
                "role": "Dense passage and embedding retrieval",
                "mode": "mock",
                "details": "In-memory cosine similarity and hybrid graph index active. AWS OpenSearch unconfigured."
            },
            {
                "service": "LLM Reasoning (Bedrock)",
                "role": "Grounded explanation generation",
                "mode": "mock",
                "details": "Local deterministic template synthesizer active. Bedrock Claude 3 adapter mocked."
            },
            {
                "service": "Routing Dispatch (Lambda)",
                "role": "Adaptive cloud execution router",
                "mode": "mock",
                "details": "In-process Python rule engine active. AWS Lambda adapter mocked."
            },
            {
                "service": "Telemetry Metrics (CloudWatch)",
                "role": "System latency and monitoring metrics",
                "mode": "mock",
                "details": "Local structured logging active. CloudWatch adapter mocked."
            }
        ]
