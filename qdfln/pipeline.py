from typing import List, Dict
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
        H_star, votes, entries = result
        print("\n========== BLOCKCHAIN CONSENSUS ==========\n")
        print(f"{EMOJI_OK} Consensus on H_agg = {H_star[:10]}... with {votes} validator votes\n")
        print("Validator hashes:")
        for vid, h in entries.items():
            print(f"   - {vid}: {h[:18]}...")
        print("\nValidator reputation:")
        for vid, score in bc.reputation.items():
            print(f"   - {vid}: {score}")
    else:
        print("\n[Blockchain] No submissions for this round")


if __name__ == "__main__":
    run_round()

