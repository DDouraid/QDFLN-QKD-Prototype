"""
FastAPI backend for PQC-secured DFLN dashboard.
Run: uvicorn api:app --reload
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from qdfln.pipeline import run_round_data

app = FastAPI(
    title="DFLN API",
    description="PQC-secured Decentralized Federated Learning Network",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.post("/api/run-round")
def run_round():
    """Run one DFLN training round and return clients, validators, consensus."""
    data = run_round_data()
    return data
