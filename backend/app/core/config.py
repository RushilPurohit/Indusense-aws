from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql+asyncpg://user:pass@localhost:5432/abb"
    QDRANT_HOST: str = "localhost"
    QDRANT_PORT: int = 6333
    NEO4J_URI: str = "bolt://localhost:7687"
    NEO4J_USER: str = "neo4j"
    NEO4J_PASSWORD: str = "password"
    GOOGLE_API_KEY: str = ""
    EMBEDDING_MODEL: str = "BAAI/bge-base-en-v1.5"
    RERANKER_MODEL: str = "cross-encoder/ms-marco-MiniLM-L-6-v2"
    MAX_UPLOAD_SIZE_MB: int = 50
    ALLOWED_EXTENSIONS: List[str] = [".pdf", ".jpg", ".jpeg", ".png"]
    OCR_CHECKPOINT_PATH: str = "ml/checkpoints/ocr/"
    LAYOUT_CHECKPOINT_PATH: str = "ml/checkpoints/layout/"
    TABLE_CHECKPOINT_PATH: str = "ml/checkpoints/table/"
    MAINTENANCE_CHECKPOINT_PATH: str = "ml/checkpoints/maintenance/"

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
