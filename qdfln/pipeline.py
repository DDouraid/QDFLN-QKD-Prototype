from typing import List, Dict

import torch

from .models import create_global_model
from .client import Client
from .validator import Validator
from .blockchain import BlockchainSim


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


def run_round():
    input_dim = 2
    global_model = create_global_model(input_dim)

    clients = _build_clients(input_dim)

    for c in clients:
        c.load_global_model(global_model)

    test_grad = clients[0].local_train_and_compute_gradient()
    grad_dim = test_grad.numel()

    validators = [Validator("V1", grad_dim), Validator("V2", grad_dim), Validator("V3", grad_dim)]
    v_ids = [v.id for v in validators]

    for c in clients:
        c.simulate_qkd_with_validators(v_ids)
        for v in validators:
            v.set_qkd_key_for_client(c.id, c.qkd_keys[v.id])

    client_grads: Dict[str, torch.Tensor] = {}
    for c in clients:
        g_vec = c.local_train_and_compute_gradient()
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
        H_agg = v.compute_H_agg(G_t)
        print(f"🛡️  Validator {v.id}: ||G_t|| = {torch.norm(G_t):.4f} | H_agg = {H_agg[:10]}...")
        bc.submit_hash(round_id, v.id, H_agg)

    result = bc.check_consensus_and_update(round_id)
    if result:
        H_star, votes, entries = result
        print("\n========== BLOCKCHAIN CONSENSUS ==========\n")
        print(f"✅ Consensus on H_agg = {H_star[:10]}... with {votes} validator votes\n")
        print("🔗 Validator hashes:")
        for vid, h in entries.items():
            print(f"   - {vid}: {h[:18]}...")
        print("\n⭐ Validator reputation:")
        for vid, score in bc.reputation.items():
            print(f"   - {vid}: {score}")
    else:
        print("\n[Blockchain] No submissions for this round")


if __name__ == "__main__":
    run_round()

