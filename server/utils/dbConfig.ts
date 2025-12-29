import { Db, MongoClient } from "mongodb";
import { env } from "../config/env";

const client = new MongoClient(env.mongoUri);
let db: Db | null = null;

export const connectToDatabase = async (): Promise<Db> => {
  if (!db) {
    try {
      await client.connect();
      db = client.db(env.dbName);
      console.log("Connected to MongoDB");
    } catch (error) {
      const err = error as Error;
      console.error("Failed to connect to MongoDB", err);
      throw err;
    }
  }

  return db;
};

export const closeDatabaseConnection = async (): Promise<void> => {
  try {
    await client.close();
  } catch (error) {
    const err = error as Error;
    console.error("Failed to close MongoDB connection", err);
  } finally {
    db = null;
  }
};
