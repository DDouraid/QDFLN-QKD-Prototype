from typing import Dict, List, Tuple

import torch
from cryptography.fernet import Fernet

from .crypto_utils import hash_bytes


class Validator:
    def __init__(self, validator_id: str, grad_dim: int):
        self.id = validator_id
        self.qkd_keys_with_clients: Dict[str, bytes] = {}
        self.received_gradients: List[Tuple[str, torch.Tensor]] = []
        self.grad_dim = grad_dim

    def set_qkd_key_for_client(self, client_id: str, key: bytes):
        self.qkd_keys_with_clients[client_id] = key

    def verify_signature(self, packet: Dict, g_bytes: bytes) -> bool:
        expected_sig = hash_bytes(packet["client_id"].encode() + g_bytes)
        return expected_sig == packet["signature"]

    def process_packet(self, packet: Dict) -> bool:
        cid = packet["client_id"]
        if cid not in self.qkd_keys_with_clients:
            print(f"[{self.id}] No QKD key for client {cid}")
            return False

        key = self.qkd_keys_with_clients[cid]
        f = Fernet(key)
        token = packet["encrypted_gradient"].encode("utf-8")
        g_bytes = f.decrypt(token)

        if hash_bytes(g_bytes) != packet["hash"]:
            print(f"[{self.id}] Hash mismatch for client {cid}")
            return False
        if not self.verify_signature(packet, g_bytes):
            print(f"[{self.id}] Signature mismatch for client {cid}")
            return False

        g_tensor = torch.frombuffer(g_bytes, dtype=torch.float32)
        if g_tensor.numel() != self.grad_dim:
            print(f"[{self.id}] Gradient dim mismatch for client {cid}")
            return False

        norm = torch.norm(g_tensor).item()
        if norm > 10.0:
            print(f"[{self.id}] Anomalous gradient from {cid}: ||g||={norm:.2f}")
            return False

        self.received_gradients.append((cid, g_tensor))
        return True

    def aggregate_gradients(self) -> torch.Tensor:
        if not self.received_gradients:
            return torch.zeros(self.grad_dim)
        stack = torch.stack([g for _, g in self.received_gradients], dim=0)
        return stack.mean(dim=0)

    def compute_H_agg(self, G_t: torch.Tensor) -> str:
        return hash_bytes(G_t.numpy().tobytes())

