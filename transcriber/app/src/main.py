#!/usr/bin/env python
import sys, os
from config import BROKER_HOST, BROKER_PORT, BROKER_USERNAME, BROKER_PASSWORD
from receiver import Receiver


def main():
    def on_message(body: bytes):
        print(f" [x] Received {body}")

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
