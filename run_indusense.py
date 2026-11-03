"""
InduSense Single-Command Runner
Launches both the FastAPI backend (port 8000) and Vite frontend (port 5173).
"""

import subprocess
import sys
import os
import time

def run():
    print("=" * 70)
    print("INDUSENSE — INTELLIGENT INDUSTRIAL MAINTENANCE")
    print("Confidence-Aware & Evidence-Grounded Predictive Maintenance")
    print("=" * 70)

    project_root = os.path.dirname(os.path.abspath(__file__))
    frontend_dir = os.path.join(project_root, "frontend")

    # 1. Run seed script first
    print("\n[1/3] Initializing and verifying seed database...")
    seed_cmd = [sys.executable, os.path.join(project_root, "seed.py")]
    subprocess.run(seed_cmd, cwd=project_root)

    # 2. Start FastAPI Backend
    print("\n[2/3] Starting FastAPI backend on http://localhost:8000 (OpenAPI docs: http://localhost:8000/docs)...")
    backend_cmd = [sys.executable, "-m", "uvicorn", "server.main:app", "--host", "127.0.0.1", "--port", "8000"]
    backend_proc = subprocess.Popen(backend_cmd, cwd=project_root)

    time.sleep(1.5)

    # 3. Start Vite Frontend
    print("\n[3/3] Starting Vite frontend on http://localhost:5173 ...")
    npm_exec = "npm.cmd" if sys.platform == "win32" else "npm"
    frontend_cmd = [npm_exec, "run", "dev"]
    frontend_proc = subprocess.Popen(frontend_cmd, cwd=frontend_dir)

    print("\n" + "=" * 70)
    print("ALL SERVICES ACTIVE:")
    print("  -> Web Application:  http://localhost:5173")
    print("  -> FastAPI Backend:  http://localhost:8000")
    print("  -> Swagger API Docs: http://localhost:8000/docs")
    print("=" * 70)
    print("\nPress Ctrl+C to shut down all InduSense services.\n")

    try:
        backend_proc.wait()
        frontend_proc.wait()
    except KeyboardInterrupt:
        print("\n[Shutting down InduSense services...]")
        backend_proc.terminate()
        frontend_proc.terminate()
        print("[Done] Both backend and frontend stopped cleanly.")

if __name__ == "__main__":
    run()
