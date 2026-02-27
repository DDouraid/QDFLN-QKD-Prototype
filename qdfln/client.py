from typing import List, Dict

import torch
import torch.nn as nn
import torch.optim as optim
from cryptography.fernet import Fernet

from .crypto_utils import hash_bytes, pqc_sig_generate_keypair, pqc_sig_sign


USE_DP = False
DP_CLIP_NORM = 1.0
DP_NOISE_STD = 0.05


def flatten_gradients(model: nn.Module) -> torch.Tensor:
    grads = []
    for p in model.parameters():
        grads.append(p.grad.view(-1))
    return torch.cat(grads)


def apply_dp_noise(g_vec: torch.Tensor) -> torch.Tensor:
    if DP_CLIP_NORM is not None:
        norm = torch.norm(g_vec)
        if norm > DP_CLIP_NORM:
            g_vec = g_vec * (DP_CLIP_NORM / (norm + 1e-8))
    noise = torch.normal(0.0, DP_NOISE_STD, size=g_vec.shape)
    return g_vec + noise


class Client:
    def __init__(self, client_id: str, X_local, y_local, input_dim: int):
        self.id = client_id
        self.X = torch.tensor(X_local, dtype=torch.float32)
        self.y = torch.tensor(y_local, dtype=torch.float32)
        self.model = nn.Linear(input_dim, 1)
        self.qkd_keys: Dict[str, bytes] = {}
        self.sig_public_key, self.sig_secret_key = pqc_sig_generate_keypair()
        self.mask_vec = torch.randn_like(self.get_param_vector()) * 0.01

    def get_param_vector(self) -> torch.Tensor:
        params = [p.data.view(-1) for p in self.model.parameters()]
        return torch.cat(params)

    def load_global_model(self, global_model: nn.Module):
        for p_self, p_global in zip(self.model.parameters(), global_model.parameters()):
            p_self.data = p_global.data.clone()

    def set_symmetric_key_for_validator(self, validator_id: str, key: bytes):
        self.qkd_keys[validator_id] = key

    def local_train_and_compute_gradient(self, epochs: int = 1, lr: float = 0.1) -> torch.Tensor:
        optimizer = optim.SGD(self.model.parameters(), lr=lr)
        loss_fn = nn.BCEWithLogLogitsLoss() if False else nn.BCEWithLogitsLoss()

        for _ in range(epochs):
            optimizer.zero_grad()
            logits = self.model(self.X).squeeze(-1)
            loss = loss_fn(logits, self.y)
            loss.backward()
            optimizer.step()

        self.model.zero_grad()
        logits = self.model(self.X).squeeze(-1)
        loss = loss_fn(logits, self.y)
        loss.backward()
        g_vec = flatten_gradients(self.model)
        if USE_DP:
            g_vec = apply_dp_noise(g_vec)
        return g_vec.detach()

    def mask_gradient(self, g_vec: torch.Tensor) -> torch.Tensor:
        return g_vec + self.mask_vec

    def create_secure_packet_for_validator(self, validator_id: str, g_vec: torch.Tensor) -> Dict:
        if validator_id not in self.qkd_keys:
            raise ValueError(f"No QKD key for validator {validator_id}")

        masked = self.mask_gradient(g_vec)
        g_bytes = masked.numpy().tobytes()

        key = self.qkd_keys[validator_id]
        f = Fernet(key)
        token = f.encrypt(g_bytes)

        h = hash_bytes(g_bytes)
        signature = pqc_sig_sign(self.sig_secret_key, g_bytes)

        return {
            "client_id": self.id,
            "validator_id": validator_id,
            "encrypted_gradient": token.decode("utf-8"),
            "hash": h,
            "signature": signature.hex(),
            "sig_public_key": self.sig_public_key.hex(),
            "length": len(g_bytes),
        }

