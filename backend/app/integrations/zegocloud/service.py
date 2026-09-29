from __future__ import annotations

import base64
import json
import random
import time
import urllib.parse
from cryptography.hazmat.primitives import padding
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes

from app.core.config import settings


def generate_zego_token(
    room_id: str,
    user_id: str,
    user_name: str,
    effective_time_in_seconds: int = 7200,
) -> str:
    if not settings.zegocloud_app_id or not settings.zegocloud_server_secret:
        raise ValueError("ZEGOCLOUD app id and server secret must be configured")

    app_id = int(settings.zegocloud_app_id)
    server_secret = settings.zegocloud_server_secret.strip().encode("utf-8")

    now = int(time.time())
    expire = now + effective_time_in_seconds
    nonce = random.randint(0, 2147483647)

    payload = {
        "app_id": app_id,
        "user_id": user_id,
        "nonce": nonce,
        "ctime": now,
        "expire": expire,
    }

    raw_json = json.dumps(payload).encode("utf-8")
    padder = padding.PKCS7(128).padder()
    padded_data = padder.update(raw_json) + padder.finalize()

    # 16-byte random IV
    iv = "".join([str(random.randint(0, 9)) for _ in range(16)]).encode("utf-8")

    cipher = Cipher(algorithms.AES(server_secret), modes.CBC(iv))
    encryptor = cipher.encryptor()
    ciphertext = encryptor.update(padded_data) + encryptor.finalize()

    ct_len = len(ciphertext)
    buf = bytearray(28 + ct_len)
    buf[0:4] = b"\x00\x00\x00\x00"
    buf[4:8] = expire.to_bytes(4, "big")
    buf[8:10] = len(iv).to_bytes(2, "big")
    buf[10:26] = iv
    buf[26:28] = ct_len.to_bytes(2, "big")
    buf[28:] = ciphertext

    part1 = "04" + base64.b64encode(buf).decode("utf-8")
    part2_dict = {
        "userID": user_id,
        "roomID": room_id,
        "userName": urllib.parse.quote(user_name),
        "appID": app_id,
    }
    part2 = base64.b64encode(json.dumps(part2_dict).encode("utf-8")).decode("utf-8")

    return f"{part1}#{part2}"
