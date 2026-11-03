"""
InduSense FastAPI Server
Confidence-Aware & Evidence-Grounded Predictive Maintenance
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from server.routes.aws_documents import router as aws_documents_router
from .api import auth, cases, assets, telemetry, documents, chunks, graph, cloud_router, research, settings_api, ml_routes

app = FastAPI(
    title="InduSense — Intelligent Industrial Maintenance",
    description="Confidence-Aware & Evidence-Grounded Predictive Maintenance Backend API",
    version="2.0.0"
)

# CORS Middleware with restricted trusted origins
raw_origins = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173")
origins = [o.strip() for o in raw_origins.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if origins else ["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "InduSense Intelligence Engine",
        "mode": "LOCAL_VERIFIED_PERSISTENCE",
        "version": "2.0.0"
    }

# Include all API routers with /api prefix
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
app.include_router(
    aws_documents_router,
    prefix="/api/documents",
    tags=["AWS Documents"]
)

if __name__ == "__main__":
    import uvicorn
    print("Starting InduSense FastAPI backend on http://localhost:8000 ...")
    uvicorn.run("server.main:app", host="0.0.0.0", port=8000, reload=True)
