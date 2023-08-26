import { MongoClient } from 'mongodb';
import {
  DB_USERNAME,
  DB_PASSWORD,
  DB_HOST,
  DB_PORT,
  DB_DATABASE,
  DB_COLLECTION,
} from '@/config';

const uri = `mongodb://${DB_USERNAME}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_DATABASE}`;
const day = 86_400_000; // ms

const client = new MongoClient(uri);

export async function read(guildID: string, time: Date) {
  try {
    await client.connect();
    const documents = client
      .db(DB_DATABASE)
      .collection(DB_COLLECTION)
      .find({
        guildID: guildID,
        time: { $gt: time.getTime() - day, $lt: time.getTime() },
      })
      .sort({ time: 1 });

    return await documents.toArray();
  } finally {
    await client.close();
  }
}
