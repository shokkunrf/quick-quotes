#!/usr/bin/env python
import json
import sys, os
from config import (
    BROKER_HOST,
    BROKER_PORT,
    BROKER_USERNAME,
    BROKER_PASSWORD,
    STORAGE_DIR,
    DB_HOST,
    DB_PORT,
    DB_DATABASE,
    DB_USERNAME,
    DB_PASSWORD,
    DB_COLLECTION,
    MODEL,
    LANGUAGE,
    ENCRYPTION_KEY,
)
from database import Database
from receiver import Receiver
from transcriber import Transcriber
from datetime import datetime, timezone
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
import base64


def main():
    if not ENCRYPTION_KEY:
        print("[SECURITY WARNING] ENCRYPTION_KEY is not set! Conversation logs will be stored in PLAIN TEXT.")
        print("Set ENCRYPTION_KEY in your environment to enable AES-256-GCM encryption.")
    else:
        print("[INFO] Encryption is enabled (AES-256-GCM).")

    transcriber = Transcriber(MODEL, LANGUAGE)
    database = Database(DB_USERNAME, DB_PASSWORD, DB_HOST, DB_PORT, DB_DATABASE)

    def on_message(body: bytes):
        b = json.loads(body)
        file_name = b["fileName"]
        print("=== transcribe ===")
        text = transcriber.transcribe(f"{STORAGE_DIR}/{file_name}")

        print("=== encrypt ===")
        is_encrypted = False
        content = {
            "text": text,
            "iv": None,
            "tag": None
        }

        if ENCRYPTION_KEY:
            try:
                key = bytes.fromhex(ENCRYPTION_KEY)
                aesgcm = AESGCM(key)
                iv = os.urandom(12)
                ct = aesgcm.encrypt(iv, text.encode('utf-8'), None)
                content = {
                    "text": base64.b64encode(ct[:-16]).decode('utf-8'),
                    "iv": base64.b64encode(iv).decode('utf-8'),
                    "tag": base64.b64encode(ct[-16:]).decode('utf-8')
                }
                is_encrypted = True
            except Exception as e:
                print(f"Encryption failed: {e}")

        print("=== create ===")

        # 数値(ms)をUTCのdatetimeオブジェクトに変換
        dt_time = datetime.fromtimestamp(b["time"] / 1000.0, tz=timezone.utc)

        database.create(
            DB_COLLECTION,
            {
                "guildID": b["guildID"],
                "userID": b["userID"],
                "time": dt_time,
                "content": content,
                "isEncrypted": is_encrypted,
                "participants": b.get("participants", []),
            },
        )
        print("=== finish ===")

    receiver = Receiver(
        host=BROKER_HOST,
        port=BROKER_PORT,
        username=BROKER_USERNAME,
        password=BROKER_PASSWORD,
    )

    print(" [*] Waiting for messages. To exit press CTRL+C")
    receiver.receive("recorded", on_message)


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("Interrupted")
        try:
            sys.exit(0)
        except SystemExit:
            os._exit(0)
