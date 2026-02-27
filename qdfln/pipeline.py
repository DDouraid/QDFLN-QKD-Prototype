from typing import List, Dict, Any
import sys
import os

import numpy as np
import pandas as pd
import torch

from .models import create_global_model
from .client import Client
from .validator import Validator
from .blockchain import BlockchainSim
from .crypto_utils import (
    pqc_kem_generate_keypair,
    pqc_kem_encapsulate,
    pqc_kem_decapsulate,
    derive_fernet_key,
)


def _ensure_clients_csv(path: str, input_dim: int, n_rows: int = 300) -> None:
    """Create a synthetic 'realistic' CSV if it doesn't exist."""
    os.makedirs(os.path.dirname(path), exist_ok=True)

    rng = np.random.default_rng(42)
    client_ids = rng.choice(
        ["C1", "C2", "C3", "C4", "C5"],
        size=n_rows,
        p=[0.2, 0.2, 0.2, 0.2, 0.2],
    )

    # Two simple numeric features; you can replace this with real data later.
    feature1 = rng.normal(loc=40, scale=12, size=n_rows)  # e.g. age-ish
    feature2 = rng.normal(loc=50_000, scale=15_000, size=n_rows)  # e.g. income-ish

    # Simple label rule: higher income + middle age => more likely 1.
    logits = 0.02 * (feature1 - 40) + 0.00005 * (feature2 - 50_000)
    probs = 1 / (1 + np.exp(-logits))
    labels = rng.binomial(1, probs)

    df = pd.DataFrame(
        {
            "client_id": client_ids,
            "feature1": feature1,
            "feature2": feature2,
            "label": labels,
        }
    )
    df.to_csv(path, index=False)


def _build_clients(input_dim: int) -> List[Client]:
    base_dir = os.path.dirname(__file__)
    banknote_path = os.path.join(base_dir, "data", "banknote.csv")
    csv_path = os.path.join(base_dir, "data", "clients.csv")

    clients: List[Client] = []

    if os.path.exists(banknote_path):
        # Real-world dataset: Banknote Authentication CSV
        df = pd.read_csv(banknote_path, encoding="latin-1")
        required_cols = {"variance", "skewness", "curtosis", "entropy", "class"}
        if required_cols.issubset(df.columns):
            X = df[["variance", "skewness", "curtosis", "entropy"]].to_numpy(dtype=float)
            y = df["class"].to_numpy(dtype=float)
            n = len(df)
            indices = np.arange(n)
            client_ids = ["C1", "C2", "C3", "C4", "C5"]
            for i, cid in enumerate(client_ids):
                mask = indices % len(client_ids) == i
                if not mask.any():
                    continue
                X_local = X[mask]
                y_local = y[mask]
                clients.append(Client(cid, X_local, y_local, input_dim))

    # If no banknote.csv or it was invalid, fall back to synthetic CSV we generate.
    if not clients:
        _ensure_clients_csv(csv_path, input_dim)
        df = pd.read_csv(csv_path)
        for cid in ["C1", "C2", "C3", "C4", "C5"]:
            sub = df[df["client_id"] == cid]
            if sub.empty:
                continue
            X_local = sub[["feature1", "feature2"]].to_numpy(dtype=float)
            y_local = sub["label"].to_numpy(dtype=float)
            clients.append(Client(cid, X_local, y_local, input_dim))

    # Final fallback to small in-code synthetic data.
    if not clients:
        X1 = [[0.2, 0.1], [0.3, 0.2], [0.1, 0.4]]
        y1 = [0, 0, 0]
        X2 = [[1.0, 1.2], [0.9, 1.1], [1.1, 0.9]]
        y2 = [1, 1, 1]
        X3 = [[0.5, 0.4], [0.6, 0.5], [0.4, 0.6]]
        y3 = [0, 0, 0]
        X4 = [[0.7, 0.3], [0.8, 0.2], [0.9, 0.4]]
        y4 = [1, 1, 1]
        X5 = [[0.3, 0.7], [0.2, 0.8], [0.4, 0.9]]
        y5 = [0, 0, 0]
        clients = [
            Client("C1", X1, y1, input_dim),
            Client("C2", X2, y2, input_dim),
            Client("C3", X3, y3, input_dim),
            Client("C4", X4, y4, input_dim),
            Client("C5", X5, y5, input_dim),
        ]

    return clients


def _supports_emoji() -> bool:
    enc = sys.stdout.encoding or ""
    return "UTF" in enc.upper()


if _supports_emoji():
    EMOJI_OK = "✅"
    EMOJI_WARN = "⚠️"
    EMOJI_VAL = "🛡️"
    EMOJI_PQC = "🔐"
else:
    EMOJI_OK = "[OK]"
    EMOJI_WARN = "[!]"
    EMOJI_VAL = "[VAL]"
    EMOJI_PQC = "[PQC]"


def run_round():
    print("\n==================================================")
    print("        PQC-SECURED DFLN TRAINING ROUND")
    print("==================================================")
    print(f"{EMOJI_PQC} KEM: ML-KEM-512  |  Signatures: SPHINCS+-SHAKE-256s")
    print(f"{EMOJI_PQC} Symmetric encryption: Fernet(AES) derived from KEM shared secrets\n")

    input_dim = 2
    global_model = create_global_model(input_dim)

    clients = _build_clients(input_dim)

    malicious_client_id = "C3"
    malicious_validator_id = "V3"

    for c in clients:
        c.load_global_model(global_model)

    test_grad = clients[0].local_train_and_compute_gradient()
    grad_dim = test_grad.numel()

    validators = [Validator("V1", grad_dim), Validator("V2", grad_dim), Validator("V3", grad_dim)]

    print("========== PQC KEM HANDSHAKE (CLIENTS <-> VALIDATORS) ==========\n")
    # PQC KEM handshake: each validator gets a KEM keypair,
    # each client derives a shared secret with every validator.
    kem_keys: Dict[str, Dict[str, bytes]] = {}
    for v in validators:
        pk, sk = pqc_kem_generate_keypair()
        kem_keys[v.id] = {"pk": pk, "sk": sk}

    for c in clients:
        for v in validators:
            ct, shared_client = pqc_kem_encapsulate(kem_keys[v.id]["pk"])
            shared_validator = pqc_kem_decapsulate(ct, kem_keys[v.id]["sk"])

            key_client = derive_fernet_key(shared_client)
            key_validator = derive_fernet_key(shared_validator)

            c.set_symmetric_key_for_validator(v.id, key_client)
            v.set_qkd_key_for_client(c.id, key_validator)
        print(f"{EMOJI_PQC} Client {c.id} established PQC keys with validators {[v.id for v in validators]}")

    client_grads: Dict[str, torch.Tensor] = {}
    print("\n========== CLIENT LOCAL TRAINING ==========\n")
    for c in clients:
        g_vec = c.local_train_and_compute_gradient()
        if c.id == malicious_client_id:
            g_vec = g_vec * 50.0
            print(f"{EMOJI_WARN} Client {c.id} is malicious: sending scaled gradient (||g||={torch.norm(g_vec):.2f})")
        else:
            print(f"{EMOJI_OK} Client {c.id}: ||g||={torch.norm(g_vec):.2f}")
        client_grads[c.id] = g_vec

    all_packets_for_validator: Dict[str, List[Dict]] = {v.id: [] for v in validators}
    for c in clients:
        g_vec = client_grads[c.id]
        for v in validators:
            pkt = c.create_secure_packet_for_validator(v.id, g_vec)
            all_packets_for_validator[v.id].append(pkt)

    bc = BlockchainSim()
    for v in validators:
        bc.register_validator(v.id, stake=10.0)
    round_id = 1

    print("\n========== VALIDATOR AGGREGATION ==========\n")
    for v in validators:
        for pkt in all_packets_for_validator[v.id]:
            v.process_packet(pkt)
        G_t = v.aggregate_gradients()
        is_malicious_validator = v.id == malicious_validator_id
        G_for_hash = -G_t if is_malicious_validator else G_t
        H_agg = v.compute_H_agg(G_for_hash)
        label = " (malicious)" if is_malicious_validator else ""
        print(f"{EMOJI_VAL} Validator {v.id}{label}: ||G_t|| = {torch.norm(G_t):.4f} | H_agg = {H_agg[:10]}...")
        bc.submit_hash(round_id, v.id, H_agg)

    result = bc.check_consensus_and_update(round_id)
    if result:
        H_star, winning_stake, entries, fraudsters = result
        print("\n========== BLOCKCHAIN CONSENSUS ==========\n")
        total_stake = sum(bc.stake.values())
        stake_pct = 100.0 * winning_stake / total_stake if total_stake > 0 else 0.0
        print(
            f"{EMOJI_OK} Consensus on H_agg = {H_star[:10]}... "
            f"with {winning_stake:.1f} / {total_stake:.1f} stake ({stake_pct:.1f}%)\n"
        )
        print("Validator hashes (by id):")
        for vid, h in entries.items():
            print(f"   - {vid}: {h[:18]}...")
        if fraudsters:
            print("\nFraud proofs triggered against validators:")
            for vid in fraudsters:
                print(f"   - {vid} (slashed, new stake={bc.stake[vid]:.2f})")
        print("\nValidator reputation and stake:")
        for vid, score in bc.reputation.items():
            stake = bc.stake.get(vid, 0.0)
            print(f"   - {vid}: reputation={score}, stake={stake:.2f}")
    else:
        print("\n[Blockchain] No submissions for this round")


def run_round_data(
    malicious_client_id: str = "C3",
    malicious_validator_id: str = "V3",
) -> Dict[str, Any]:
    """Run one DFLN round and return structured data for API/frontend."""
    logs: List[str] = []

    # Header (mirror CLI simulation)
    logs.append("==================================================")
    logs.append("        PQC-SECURED DFLN TRAINING ROUND")
    logs.append("==================================================")
    logs.append(f"{EMOJI_PQC} KEM: ML-KEM-512  |  Signatures: SPHINCS+-SHAKE-256s")
    logs.append(f"{EMOJI_PQC} Symmetric encryption: Fernet(AES) derived from KEM shared secrets")
    logs.append("")

    input_dim = 2
    global_model = create_global_model(input_dim)
    clients = _build_clients(input_dim)

    for c in clients:
        c.load_global_model(global_model)

    test_grad = clients[0].local_train_and_compute_gradient()
    grad_dim = test_grad.numel()
    validators = [Validator("V1", grad_dim), Validator("V2", grad_dim), Validator("V3", grad_dim)]

    kem_keys: Dict[str, Dict[str, bytes]] = {}
    logs.append("========== PQC KEM HANDSHAKE (CLIENTS <-> VALIDATORS) ==========")
    logs.append("")
    for v in validators:
        pk, sk = pqc_kem_generate_keypair()
        kem_keys[v.id] = {"pk": pk, "sk": sk}

    for c in clients:
        for v in validators:
            ct, shared_client = pqc_kem_encapsulate(kem_keys[v.id]["pk"])
            shared_validator = pqc_kem_decapsulate(ct, kem_keys[v.id]["sk"])
            key_client = derive_fernet_key(shared_client)
            key_validator = derive_fernet_key(shared_validator)
            c.set_symmetric_key_for_validator(v.id, key_client)
            v.set_qkd_key_for_client(c.id, key_validator)
        logs.append(f"{EMOJI_PQC} Client {c.id} established PQC keys with validators {[v.id for v in validators]}")

    logs.append("")
    logs.append("========== CLIENT LOCAL TRAINING ==========")
    logs.append("")

    client_grads: Dict[str, torch.Tensor] = {}
    client_infos: List[Dict[str, Any]] = []
    for c in clients:
        g_vec = c.local_train_and_compute_gradient()
        if c.id == malicious_client_id:
            g_vec = g_vec * 50.0
            logs.append(
                f"{EMOJI_WARN} Client {c.id} is malicious: "
                f"sending scaled gradient (||g||={torch.norm(g_vec):.2f})"
            )
        else:
            logs.append(f"{EMOJI_OK} Client {c.id}: ||g||={torch.norm(g_vec):.2f}")
        client_grads[c.id] = g_vec
        client_infos.append({
            "id": c.id,
            "grad_norm": round(float(torch.norm(g_vec)), 4),
            "malicious": c.id == malicious_client_id,
        })

    all_packets_for_validator: Dict[str, List[Dict]] = {v.id: [] for v in validators}
    for c in clients:
        g_vec = client_grads[c.id]
        for v in validators:
            pkt = c.create_secure_packet_for_validator(v.id, g_vec)
            all_packets_for_validator[v.id].append(pkt)

    bc = BlockchainSim()
    for v in validators:
        bc.register_validator(v.id, stake=10.0)
    round_id = 1

    validator_infos: List[Dict[str, Any]] = []
    logs.append("")
    logs.append("========== VALIDATOR AGGREGATION ==========")
    logs.append("")
    for v in validators:
        for pkt in all_packets_for_validator[v.id]:
            v.process_packet(pkt)
        G_t = v.aggregate_gradients()
        is_malicious = v.id == malicious_validator_id
        G_for_hash = -G_t if is_malicious else G_t
        H_agg = v.compute_H_agg(G_for_hash)
        bc.submit_hash(round_id, v.id, H_agg)
        label = " (malicious)" if is_malicious else ""
        logs.append(
            f"{EMOJI_VAL} Validator {v.id}{label}: "
            f"||G_t|| = {torch.norm(G_t):.4f} | H_agg = {H_agg[:10]}..."
        )
        validator_infos.append({
            "id": v.id,
            "grad_norm": round(float(torch.norm(G_t)), 4),
            "H_agg": H_agg,
            "malicious": is_malicious,
        })

    result = bc.check_consensus_and_update(round_id)
    consensus: Dict[str, Any] = {}
    if result:
        H_star, winning_stake, entries, fraudsters = result
        total_stake = sum(bc.stake.values())
        stake_pct = 100.0 * winning_stake / total_stake if total_stake > 0 else 0.0
        logs.append("")
        logs.append("========== BLOCKCHAIN CONSENSUS ==========")
        logs.append("")
        logs.append(
            f"{EMOJI_OK} Consensus on H_agg = {H_star[:10]}... "
            f"with {winning_stake:.1f} / {total_stake:.1f} stake ({stake_pct:.1f}%)"
        )
        logs.append("")
        logs.append("Validator hashes (by id):")
        for vid, h in entries.items():
            logs.append(f"   - {vid}: {h[:18]}...")
        if fraudsters:
            logs.append("")
            logs.append("Fraud proofs triggered against validators:")
            for vid in fraudsters:
                logs.append(f"   - {vid} (slashed, new stake={bc.stake[vid]:.2f})")
        logs.append("")
        logs.append("Validator reputation and stake:")
        for vid, score in bc.reputation.items():
            stake = bc.stake.get(vid, 0.0)
            logs.append(f"   - {vid}: reputation={score}, stake={stake:.2f}")

        consensus = {
            "H_star": H_star,
            "winning_stake": winning_stake,
            "total_stake": total_stake,
            "stake_pct": round(stake_pct, 1),
            "entries": {vid: h for vid, h in entries.items()},
            "fraudsters": fraudsters,
            "reputation": dict(bc.reputation),
            "stake": dict(bc.stake),
        }

    return {
        "round_id": round_id,
        "clients": client_infos,
        "validators": validator_infos,
        "consensus": consensus,
        "logs": logs,
    }


if __name__ == "__main__":
    run_round()

