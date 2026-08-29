import base64
import os
import secrets
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import x25519

def generate_keypair():
    # Use wireguard-tools if available or pure python implementation
    # For now, let's use a simple implementation of x25519 (wg uses x25519)
    # Actually, WireGuard uses base64 encoded Curve25519 keys
    # To avoid external dependencies (like wg tool in backend container),
    # let's generate using cryptography

    private_key = x25519.X25519PrivateKey.generate()
    public_key = private_key.public_key()

    priv_bytes = private_key.private_bytes(
        encoding=serialization.Encoding.Raw,
        format=serialization.PrivateFormat.Raw,
        encryption_algorithm=serialization.NoEncryption()
    )
    pub_bytes = public_key.public_bytes(
        encoding=serialization.Encoding.Raw,
        format=serialization.PublicFormat.Raw
    )

    return base64.b64encode(priv_bytes).decode('utf-8'), base64.b64encode(pub_bytes).decode('utf-8')

def generate_config(profile, server):
    config = f"""[Interface]
PrivateKey = {profile.private_key}
Address = {profile.internal_ip}/32
DNS = 1.1.1.1

[Peer]
PublicKey = {server.public_key}
Endpoint = {server.ip_address}:51820
AllowedIPs = 0.0.0.0/0
PersistentKeepalive = 20
"""
    return config

def get_next_ip(db, server_id):
    from backend.database import VPNProfile
    # Simple IP allocation: 10.0.0.2 to 10.0.0.254
    # Real systems use more robust IPAM
    profiles = db.query(VPNProfile).filter(VPNProfile.server_id == server_id).all()
    used_ips = [p.internal_ip for p in profiles]

    for i in range(2, 255):
        ip = f"10.0.0.{i}"
        if ip not in used_ips:
            return ip
    return None
