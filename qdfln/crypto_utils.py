import os
import base64
import hashlib

from pqcrypto.kem.ml_kem_512 import generate_keypair as kem_generate_keypair, encrypt as kem_encrypt, decrypt as kem_decrypt
from pqcrypto.sign.sphincs_shake_256s_simple import (
    generate_keypair as sig_generate_keypair,
    sign as sig_sign,
    verify as sig_verify,
)


def hash_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


# --------- KEM (PQC) helpers ---------


def pqc_kem_generate_keypair() -> tuple[bytes, bytes]:
    """Return (public_key, secret_key) for ML-KEM-512."""
    return kem_generate_keypair()


def pqc_kem_encapsulate(public_key: bytes) -> tuple[bytes, bytes]:
    """Client side: return (ciphertext, shared_secret)."""
    ciphertext, shared = kem_encrypt(public_key)
    return ciphertext, shared


def pqc_kem_decapsulate(ciphertext: bytes, secret_key: bytes) -> bytes:
    """Validator side: recover shared_secret from ciphertext."""
    return kem_decrypt(secret_key, ciphertext)


def derive_fernet_key(shared_secret: bytes) -> bytes:
    """
    Derive a 32-byte symmetric key from a shared secret, formatted
    as a Fernet-compatible base64 key.
    """
    raw = hashlib.sha256(shared_secret).digest()
    return base64.urlsafe_b64encode(raw)


# --------- Signature (PQC) helpers ---------


def pqc_sig_generate_keypair() -> tuple[bytes, bytes]:
    """Return (public_key, secret_key) for SPHINCS+-SHAKE-256s."""
    return sig_generate_keypair()


def pqc_sig_sign(secret_key: bytes, message: bytes) -> bytes:
    return sig_sign(secret_key, message)


def pqc_sig_verify(public_key: bytes, message: bytes, signature: bytes) -> bool:
    return sig_verify(public_key, message, signature)


