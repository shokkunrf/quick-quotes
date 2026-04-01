import { MongoClient, Document } from 'mongodb';
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
export interface TranscriptContent {
  text: string;
  iv: string;
  tag: string;
}

export interface TranscriptDocument extends Document {
  guildID: string;
  userID: string;
  time: Date;
  content: TranscriptContent;
  isEncrypted: boolean;
  participants: string[];
}

export async function read(
  guildID: string,
  time: Date,
  userID: string
): Promise<TranscriptDocument[]> {
  try {
    await client.connect();
    const documents = client
      .db(DB_DATABASE)
      .collection<TranscriptDocument>(DB_COLLECTION)
      .find({
        guildID: guildID,
        participants: userID,
        time: { $gt: new Date(time.getTime() - day), $lt: time },
      })
      .sort({ time: 1 });

    const docs = await documents.toArray();

    return docs.map((doc) => ({
      ...doc,
      content: {
        text: doc.content?.text ?? '',
        iv: doc.content?.iv ?? '',
        tag: doc.content?.tag ?? '',
      },
    })) as TranscriptDocument[];
  } finally {
    await client.close();
  }
}
