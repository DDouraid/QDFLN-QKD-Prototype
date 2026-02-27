from typing import List, Dict, Any
import sys

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


def _build_clients(input_dim: int) -> List[Client]:
    X1 = [[0.2, 0.1], [0.3, 0.2], [0.1, 0.4]]
    y1 = [0, 0, 0]
    X2 = [[1.0, 1.2], [0.9, 1.1], [1.1, 0.9]]
    y2 = [1, 1, 1]
    X3 = [[0.5, 0.4], [0.6, 0.5], [0.4, 0.6]]
    y3 = [0, 0, 0]

    return [
        Client("C1", X1, y1, input_dim),
        Client("C2", X2, y2, input_dim),
        Client("C3", X3, y3, input_dim),
    ]


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
    input_dim = 2
    global_model = create_global_model(input_dim)
    clients = _build_clients(input_dim)

    for c in clients:
        c.load_global_model(global_model)

    test_grad = clients[0].local_train_and_compute_gradient()
    grad_dim = test_grad.numel()
    validators = [Validator("V1", grad_dim), Validator("V2", grad_dim), Validator("V3", grad_dim)]

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

    client_grads: Dict[str, torch.Tensor] = {}
    client_infos: List[Dict[str, Any]] = []
    for c in clients:
        g_vec = c.local_train_and_compute_gradient()
        if c.id == malicious_client_id:
            g_vec = g_vec * 50.0
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
    for v in validators:
        for pkt in all_packets_for_validator[v.id]:
            v.process_packet(pkt)
        G_t = v.aggregate_gradients()
        is_malicious = v.id == malicious_validator_id
        G_for_hash = -G_t if is_malicious else G_t
        H_agg = v.compute_H_agg(G_for_hash)
        bc.submit_hash(round_id, v.id, H_agg)
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
    }


if __name__ == "__main__":
    run_round()

