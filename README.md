## QDFLN – Quantum-secured Decentralized Federated Learning Demo

This project is a minimal simulation of a Quantum-secured Decentralized Federated Learning Network (QDFLN):

- Clients train a small logistic-regression model locally and produce gradients.
- Gradients are masked and encrypted with keys that simulate QKD-derived symmetric keys (via Fernet/AES).
- Validators decrypt, verify, aggregate gradients, and submit aggregation hashes.
- A simple blockchain simulator checks consensus on aggregation hashes and tracks validator reputation.

### Running a demo round

1. Create and activate a virtual environment (optional but recommended).
2. Install dependencies:

```bash
pip install -r requirements.txt
```

3. Run one federated-learning round:

```bash
python -m qdfln.pipeline
```

