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
)
from database import Database
from receiver import Receiver
from transcriber import Transcriber


def main():
    transcriber = Transcriber(MODEL, LANGUAGE)
    database = Database(DB_USERNAME, DB_PASSWORD, DB_HOST, DB_PORT, DB_DATABASE)

    def on_message(body: bytes):
        b = json.loads(body)
        file_name = b["fileName"]
        print("=== transcribe ===")
        text = transcriber.transcribe(f"{STORAGE_DIR}/{file_name}")
        print("=== create ===")
        database.create(
            DB_COLLECTION,
            {
                "guildID": b["guildID"],
                "userID": b["userID"],
                "time": b["time"],
                "text": text,
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
