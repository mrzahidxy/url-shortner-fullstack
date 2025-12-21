import express, { Request, Response } from "express";
import { Collection } from "mongodb";
import { generateShortCode, isValidUrl } from "../utils/common-method";
import { connectToDatabase } from "../utils/dbConfig";
import {
  ErrorResponse,
  ShortCodeParams,
  ShortenRequestBody,
  ShortenResponse,
} from "../types/api";
import { UrlDocument } from "../types/url";

const shortnerRouter = express.Router();

const baseUrl = process.env.BASE_URL;

if (!baseUrl) {
  throw new Error("BASE_URL environment variable is not set");
}

const getUrlCollection = async (): Promise<Collection<UrlDocument>> => {
  const db = await connectToDatabase();
  return db.collection<UrlDocument>("urls");
};

shortnerRouter.post<
  unknown,
  ShortenResponse | ErrorResponse,
  ShortenRequestBody
>("/shorten", async (req: Request<unknown, ShortenResponse | ErrorResponse, ShortenRequestBody>, res: Response<ShortenResponse | ErrorResponse>) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }

  if (!isValidUrl(url)) {
    return res.status(400).json({ error: "Invalid URL format" });
  }

  try {
    const collection = await getUrlCollection();

    const existing = await collection.findOne({ originalUrl: url });

    if (existing) {
      return res
        .status(200)
        .json({ shortUrl: `${baseUrl}/${existing.shortCode}` });
    }

    let shortCode: string;
    do {
      shortCode = generateShortCode();
    } while (await collection.findOne({ shortCode }));

    const newEntry: UrlDocument = {
      shortCode,
      originalUrl: url,
      createdAt: new Date(),
    };

    await collection.insertOne(newEntry);

    return res.status(201).json({ shortUrl: `${baseUrl}/${shortCode}` });
  } catch (error) {
    const err = error as Error;
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

shortnerRouter.get<ShortCodeParams>(
  "/:shortCode",
  async (
    req: Request<ShortCodeParams>,
    res: Response<ErrorResponse>
  ): Promise<Response<ErrorResponse> | void> => {
    const { shortCode } = req.params;

    try {
      const collection = await getUrlCollection();
      const entry = await collection.findOne({ shortCode });

      if (!entry) {
        return res.status(404).json({ error: "Short URL not found" });
      }

      return res.redirect(entry.originalUrl);
    } catch (error) {
      const err = error as Error;
      console.error(err);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
);

export default shortnerRouter;
