import pika


class Receiver:
    _connection: pika.BlockingConnection

    def __init__(self, username: str, password: str, host: str, port: int):
        credentials = pika.PlainCredentials(username=username, password=password)
        self._connection = pika.BlockingConnection(
            pika.ConnectionParameters(host=host, port=port, credentials=credentials)
        )

    def receive(self, queue: str, on_message: [[bytes], None]):
        def callback(channel, method, properties, body):
            on_message(body)

        channel = self._connection.channel()
        channel.queue_declare(queue=queue)
        channel.basic_consume(queue=queue, on_message_callback=callback, auto_ack=True)
        channel.start_consuming()
