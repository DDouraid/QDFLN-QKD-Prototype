# DFLN Dashboard

React frontend for the PQC-secured DFLN (Decentralized Federated Learning Network).

## Run

1. Start the API (from project root):
   ```bash
   uvicorn api:app --reload
   ```
2. Start the frontend:
   ```bash
   cd frontend && npm install && npm run dev
   ```
3. Open http://localhost:5173 — use "Run training round" to run one round and see clients, validators, and blockchain consensus.
