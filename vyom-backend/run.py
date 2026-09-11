"""VYOM Backend — One-command startup script."""
import subprocess
import sys
import os

backend_dir = os.path.dirname(os.path.abspath(__file__))
os.chdir(backend_dir)

print(f"[VYOM] Starting FastAPI backend from {backend_dir}...")
print("[VYOM] API Docs: http://localhost:8000/docs")
print("[VYOM] WebSocket: ws://localhost:8000/ws/{mission_id}")

try:
    subprocess.run([
        sys.executable, "-m", "uvicorn", "main:app",
        "--host", "0.0.0.0",
        "--port", "8000",
        "--reload",
        "--log-level", "info",
    ])
except KeyboardInterrupt:
    print("\n[VYOM] Backend shutdown requested.")
