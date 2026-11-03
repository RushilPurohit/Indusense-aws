import sys
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Ensure root directory is on python path so server.* imports succeed
root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if root_dir not in sys.path:
    sys.path.insert(0, root_dir)

from server.api import auth, cases, assets, telemetry, documents, chunks, graph, cloud_router, research, settings_api, ml_routes

app = FastAPI(
    title="InduSense — Intelligent Industrial Maintenance",
    description="Confidence-Aware & Evidence-Grounded Predictive Maintenance",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    try:
        from .database.postgres import create_tables
        await create_tables()
    except Exception as e:
        print(f"[InduSense DB] Notice: Relational DB initialization fallback (SQLite/Local mode): {e}")

@app.get("/health")
@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "InduSense Intelligence Engine",
        "mode": "LOCAL_ZERO_AWS_CREDENTIALS",
        "version": "2.0.0"
    }

# Unified InduSense API Routers
app.include_router(cases.router, prefix="/api/cases", tags=["cases"])
app.include_router(assets.router, prefix="/api/assets", tags=["assets"])
app.include_router(telemetry.router, prefix="/api/telemetry", tags=["telemetry"])
app.include_router(documents.router, prefix="/api/documents", tags=["documents"])
app.include_router(chunks.router, prefix="/api/chunks", tags=["chunks"])
app.include_router(graph.router, prefix="/api/graph", tags=["graph"])
app.include_router(cloud_router.router, prefix="/api/router", tags=["router"])
app.include_router(cloud_router.router, prefix="/api/cloud", tags=["cloud"])
app.include_router(research.router, prefix="/api/research", tags=["research"])
app.include_router(research.router, prefix="/api/monitoring", tags=["monitoring"])
app.include_router(settings_api.router, prefix="/api/settings", tags=["settings"])
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(ml_routes.router, prefix="/api/ml", tags=["ml"])
