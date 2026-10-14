import base64
import json
import os
from typing import Tuple, Dict, Any
from Crypto.Cipher import PKCS1_v1_5, AES
from Crypto.PublicKey import RSA
from Crypto.Signature import pkcs1_15
from Crypto.Hash import SHA256
from Crypto.Util.Padding import pad, unpad

class NagadCrypto:
    @staticmethod
    def generate_aes_keys() -> Tuple[bytes, bytes]:
        """Generates random 16-byte key and 16-byte IV for AES-128."""
        key = os.urandom(16)
        iv = os.urandom(16)
        return key, iv

    @staticmethod
    def encrypt_rsa(plain_text: str, public_key_pem: str) -> str:
        """Encrypts data with RSA Public Key (PKCS1 v1.5) and returns Base64."""
        rsa_key = RSA.import_key(public_key_pem)
        cipher = PKCS1_v1_5.new(rsa_key)
        encrypted_bytes = cipher.encrypt(plain_text.encode('utf-8'))
        return base64.b64encode(encrypted_bytes).decode('utf-8')

    @staticmethod
    def decrypt_rsa(cipher_text_b64: str, private_key_pem: str) -> str:
        """Decrypts Base64 ciphertext with merchant RSA Private Key."""
        rsa_key = RSA.import_key(private_key_pem)
        cipher = PKCS1_v1_5.new(rsa_key)
        cipher_bytes = base64.b64decode(cipher_text_b64)
        decrypted_bytes = cipher.decrypt(cipher_bytes, sentinel=None)
        if decrypted_bytes is None:
            raise ValueError("RSA decryption failed")
        return decrypted_bytes.decode('utf-8')

    @staticmethod
    def sign_sha256(data: str, private_key_pem: str) -> str:
        """Signs payload using SHA256 with PKCS#1 v1.5 and returns Base64."""
        rsa_key = RSA.import_key(private_key_pem)
        digest = SHA256.new(data.encode('utf-8'))
        signature = pkcs1_15.new(rsa_key).sign(digest)
        return base64.b64encode(signature).decode('utf-8')

    @staticmethod
    def verify_signature(data: str, signature_b64: str, public_key_pem: str) -> bool:
        """Verifies signature from Nagad using Nagad's RSA Public Key."""
        try:
            rsa_key = RSA.import_key(public_key_pem)
            digest = SHA256.new(data.encode('utf-8'))
            signature_bytes = base64.b64decode(signature_b64)
            pkcs1_15.new(rsa_key).verify(digest, signature_bytes)
            return True
        except (ValueError, TypeError):
            return False

    @staticmethod
    def encrypt_aes_cbc(data_dict: Dict[str, Any], key: bytes, iv: bytes) -> str:
        """Encrypts JSON dictionary with AES-128-CBC with PKCS#7 padding."""
        raw_text = json.dumps(data_dict, separators=(',', ':')).encode('utf-8')
        cipher = AES.new(key, AES.MODE_CBC, iv)
        padded_data = pad(raw_text, AES.block_size)
        encrypted_bytes = cipher.encrypt(padded_data)
        return base64.b64encode(encrypted_bytes).decode('utf-8')

    @staticmethod
    def decrypt_aes_cbc(encrypted_b64: str, key: bytes, iv: bytes) -> Dict[str, Any]:
        """Decrypts Base64 AES-128-CBC cipher text and parses JSON."""
        cipher_bytes = base64.b64decode(encrypted_b64)
        cipher = AES.new(key, AES.MODE_CBC, iv)
        decrypted_padded = cipher.decrypt(cipher_bytes)
        decrypted_raw = unpad(decrypted_padded, AES.block_size).decode('utf-8')
        return json.loads(decrypted_raw)
