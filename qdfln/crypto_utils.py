import os
import base64
import hashlib


def simulate_qkd_key() -> bytes:
    raw = os.urandom(32)
    return base64.urlsafe_b64encode(raw)


def hash_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()

