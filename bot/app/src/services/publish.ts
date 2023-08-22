import {
  BROKER_HOST,
  BROKER_PASSWORD,
  BROKER_PORT,
  BROKER_USERNAME,
} from '@/config';
import amqp from 'amqplib';

const publishQueue = 'recorded';
const broker = `amqp://${BROKER_USERNAME}:${BROKER_PASSWORD}@${BROKER_HOST}:${BROKER_PORT}`;

export type RecordedMessage = {
  guildID: string;
  userID: string;
  time: Date;
  fileName: string;
};

export async function publishRecordedMessage(message: RecordedMessage) {
  const m = JSON.stringify({ ...message, time: message.time.getTime() });
  await publish(publishQueue, m);
}

async function publish(queue: string, message: string) {
  const connection = await amqp.connect(broker);
  const channel = await connection.createChannel();

  await channel.assertQueue(queue, { durable: false });
  channel.sendToQueue(queue, Buffer.from(message));

  setTimeout(function () {
    connection.close();
  }, 500);
}
