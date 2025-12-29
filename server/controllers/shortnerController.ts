import { Request, Response } from "express";
import { HttpError } from "../middleware/errorHandler";
import { env } from "../config/env";
import {
  ErrorResponse,
  ShortCodeParams,
  ShortenRequestBody,
  ShortenResponse,
} from "../types/api";
import { isValidUrl } from "../utils/common-method";
import { findOriginalUrl, getOrCreateShortCode } from "../services/urlService";

export const createShortUrl = async (
  req: Request<unknown, ShortenResponse | ErrorResponse, ShortenRequestBody>,
  res: Response<ShortenResponse>
): Promise<Response<ShortenResponse>> => {
  const { url } = req.body;

  if (!url) {
    throw new HttpError(400, "URL is required");
  }

  if (!isValidUrl(url)) {
    throw new HttpError(400, "Invalid URL format");
  }

  const { shortCode, isNew } = await getOrCreateShortCode(url);
  const shortUrl = `${env.baseUrl}/${shortCode}`;

  return res.status(isNew ? 201 : 200).json({ shortUrl });
};

export const redirectShortUrl = async (
  req: Request<ShortCodeParams>,
  res: Response<ErrorResponse>
): Promise<Response<ErrorResponse> | void> => {
  const { shortCode } = req.params;
  const originalUrl = await findOriginalUrl(shortCode);

  if (!originalUrl) {
    throw new HttpError(404, "Short URL not found");
  }

  return res.redirect(originalUrl);
};
