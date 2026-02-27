from typing import Dict, List, Tuple, Optional

import torch
import torch.nn.functional as F
from cryptography.fernet import Fernet

from .crypto_utils import hash_bytes, pqc_sig_verify


class Validator:
    def __init__(
        self,
        validator_id: str,
        grad_dim: int,
        agg_mode: str = "median",
        trim_ratio: float = 0.2,
        norm_threshold: float = 10.0,
        cos_threshold: float = -0.2,
        max_suspicion: int = 2,
    ):
        self.id = validator_id
        self.qkd_keys_with_clients: Dict[str, bytes] = {}
        self.received_gradients: List[Tuple[str, torch.Tensor]] = []
        self.grad_dim = grad_dim

        self.agg_mode = agg_mode
        self.trim_ratio = trim_ratio
        self.norm_threshold = norm_threshold
        self.cos_threshold = cos_threshold
        self.max_suspicion = max_suspicion

        self.ref_grad: Optional[torch.Tensor] = None
        self.client_suspicion: Dict[str, int] = {}

    def set_qkd_key_for_client(self, client_id: str, key: bytes):
        self.qkd_keys_with_clients[client_id] = key

    def verify_signature(self, packet: Dict, g_bytes: bytes) -> bool:
        signature = bytes.fromhex(packet["signature"])
        public_key = bytes.fromhex(packet["sig_public_key"])
        return pqc_sig_verify(public_key, g_bytes, signature)

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
        if norm > self.norm_threshold:
            print(f"[{self.id}] Norm anomaly from {cid}: ||g||={norm:.2f} > {self.norm_threshold}")
            return False

        if self.ref_grad is not None:
            cos = F.cosine_similarity(
                g_tensor.view(1, -1),
                self.ref_grad.view(1, -1),
                dim=1,
            ).item()
            if cos < self.cos_threshold:
                prev = self.client_suspicion.get(cid, 0)
                self.client_suspicion[cid] = prev + 1
                print(f"[{self.id}] Cosine anomaly from {cid}: cos={cos:.2f}, suspicion={self.client_suspicion[cid]}")
                if self.client_suspicion[cid] >= self.max_suspicion:
                    print(f"[{self.id}] Blocking client {cid} due to repeated anomalies")
                    return False

        if self.ref_grad is None:
            self.ref_grad = g_tensor.clone()
        else:
            self.ref_grad = 0.9 * self.ref_grad + 0.1 * g_tensor

        self.received_gradients.append((cid, g_tensor))
        return True

    def aggregate_gradients(self) -> torch.Tensor:
        if not self.received_gradients:
            return torch.zeros(self.grad_dim)
        stack = torch.stack([g for _, g in self.received_gradients], dim=0)

        if self.agg_mode == "median":
            return torch.median(stack, dim=0).values

        if self.agg_mode == "trimmed_mean":
            n = stack.size(0)
            k = int(self.trim_ratio * n)
            if k == 0 or n <= 2 * k:
                return stack.mean(dim=0)
            sorted_vals, _ = torch.sort(stack, dim=0)
            trimmed = sorted_vals[k : n - k, :]
            return trimmed.mean(dim=0)

        return stack.mean(dim=0)

    def compute_H_agg(self, G_t: torch.Tensor) -> str:
        return hash_bytes(G_t.numpy().tobytes())

