#!/usr/bin/env python
import json
import sys, os
from config import (
    BROKER_HOST,
    BROKER_PORT,
    BROKER_USERNAME,
    BROKER_PASSWORD,
    STORAGE_DIR,
)
from receiver import Receiver
from transcriber import Transcriber


def main():
    transcriber = Transcriber()

    def on_message(body: bytes):
        b = json.loads(body)
        file_name = b["fileName"]
        text = transcriber.transcribe(f"{STORAGE_DIR}/{file_name}")
        print("=== received ===: " + text)

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
