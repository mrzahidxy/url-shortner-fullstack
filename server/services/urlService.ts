import { Collection } from "mongodb";
import { connectToDatabase } from "../utils/dbConfig";
import { generateShortCode } from "../utils/common-method";
import { UrlDocument } from "../types/url";

const getUrlCollection = async (): Promise<Collection<UrlDocument>> => {
  const db = await connectToDatabase();
  return db.collection<UrlDocument>("urls");
};

export const getOrCreateShortCode = async (
  originalUrl: string
): Promise<{ shortCode: string; isNew: boolean }> => {
  const collection = await getUrlCollection();
  const existing = await collection.findOne({ originalUrl });

  if (existing) {
    return { shortCode: existing.shortCode, isNew: false };
  }

  let shortCode: string;
  do {
    shortCode = generateShortCode();
  } while (await collection.findOne({ shortCode }));

  const newEntry: UrlDocument = {
    shortCode,
    originalUrl,
    createdAt: new Date(),
  };

  await collection.insertOne(newEntry);

  return { shortCode, isNew: true };
};

export const findOriginalUrl = async (
  shortCode: string
): Promise<string | null> => {
  const collection = await getUrlCollection();
  const entry = await collection.findOne({ shortCode });

  return entry ? entry.originalUrl : null;
};
