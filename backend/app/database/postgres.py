from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy import Column, Integer, String, Float, ForeignKey, JSON, DateTime
from datetime import datetime
from ..core.config import settings

db_url = settings.DATABASE_URL
try:
    engine = create_async_engine(db_url, echo=False)
    AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
except Exception:
    # Fallback to SQLite async or sync
    try:
        engine = create_async_engine("sqlite+aiosqlite:///./abb_maintenance.db", echo=False)
        AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    except Exception:
        from sqlalchemy import create_engine
        engine = create_engine("sqlite:///./abb_maintenance.db", echo=False)
        AsyncSessionLocal = sessionmaker(engine, expire_on_commit=False)

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)

class Document(Base):
    __tablename__ = "documents"
    id = Column(String, primary_key=True, index=True)
    filename = Column(String)
    file_path = Column(String, nullable=True)
    file_type = Column(String, default="PDF")
    size = Column(Integer, default=0)
    uploaded_at = Column(DateTime, default=datetime.utcnow)
    status = Column(String, default="uploaded") # uploaded, processing, ready, failed
    current_step = Column(String, default="Uploading")
    progress = Column(Float, default=0.0)
    page_count = Column(Integer, default=0)
    chunk_count = Column(Integer, default=0)
    table_count = Column(Integer, default=0)
    figure_count = Column(Integer, default=0)
    error = Column(String, nullable=True)

class Page(Base):
    __tablename__ = "pages"
    id = Column(String, primary_key=True)
    document_id = Column(String, ForeignKey("documents.id"))
    page_num = Column(Integer)
    text_content = Column(String)

class Chunk(Base):
    __tablename__ = "chunks"
    id = Column(String, primary_key=True)
    document_id = Column(String, ForeignKey("documents.id"))
    page_num = Column(Integer)
    text = Column(String)

class TableRecord(Base):
    __tablename__ = "tables"
    id = Column(String, primary_key=True)
    document_id = Column(String, ForeignKey("documents.id"))
    page_num = Column(Integer)
    content = Column(JSON)

class DiagramRecord(Base):
    __tablename__ = "diagrams"
    id = Column(String, primary_key=True)
    document_id = Column(String, ForeignKey("documents.id"))
    page_num = Column(Integer)
    description = Column(String)
    bbox = Column(JSON)

class Query(Base):
    __tablename__ = "queries"
    id = Column(String, primary_key=True)
    text = Column(String)
    timestamp = Column(DateTime, default=datetime.utcnow)

class Answer(Base):
    __tablename__ = "answers"
    id = Column(String, primary_key=True)
    query_id = Column(String, ForeignKey("queries.id"))
    text = Column(String)

class Citation(Base):
    __tablename__ = "citations"
    id = Column(String, primary_key=True)
    answer_id = Column(String, ForeignKey("answers.id"))
    chunk_id = Column(String, ForeignKey("chunks.id"))

class MachinePrediction(Base):
    __tablename__ = "machine_predictions"
    id = Column(String, primary_key=True)
    sensor_data = Column(JSON)
    prediction = Column(JSON)
    timestamp = Column(DateTime, default=datetime.utcnow)

async def create_tables():
    if hasattr(engine, 'begin') and hasattr(engine.begin(), '__aenter__'):
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
    else:
        Base.metadata.create_all(bind=engine)
        # SQLite column migration check
        try:
            with engine.connect() as conn:
                for col, col_type in [
                    ("file_path", "TEXT"),
                    ("file_type", "TEXT DEFAULT 'PDF'"),
                    ("size", "INTEGER DEFAULT 0"),
                    ("current_step", "TEXT DEFAULT 'Uploading'"),
                    ("progress", "FLOAT DEFAULT 0.0"),
                    ("page_count", "INTEGER DEFAULT 0"),
                    ("chunk_count", "INTEGER DEFAULT 0"),
                    ("table_count", "INTEGER DEFAULT 0"),
                    ("figure_count", "INTEGER DEFAULT 0"),
                    ("error", "TEXT")
                ]:
                    try:
                        from sqlalchemy import text
                        conn.execute(text(f"ALTER TABLE documents ADD COLUMN {col} {col_type}"))
                        conn.commit()
                    except Exception:
                        pass
        except Exception:
            pass

async def get_db():
    if hasattr(AsyncSessionLocal(), '__aenter__'):
        async with AsyncSessionLocal() as session:
            yield session
    else:
        db = AsyncSessionLocal()
        try:
            yield db
        finally:
            db.close()
