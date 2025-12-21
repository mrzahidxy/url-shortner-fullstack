import { Db, MongoClient } from "mongodb";

const uri = process.env.MONGO_URI;

if (!uri) {
  throw new Error("MONGO_URI environment variable is not set");
}

const client = new MongoClient(uri);
let db: Db | null = null;

export const connectToDatabase = async (): Promise<Db> => {
  if (!db) {
    try {
      await client.connect();
      db = client.db(process.env.DB_NAME ?? "urlShortener");
      console.log("Connected to MongoDB Atlas");
    } catch (error) {
      const err = error as Error;
      console.error("Failed to connect to MongoDB", err);
      throw err;
    }
  }

  return db;
};
