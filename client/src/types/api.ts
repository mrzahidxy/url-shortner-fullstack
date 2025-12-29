export interface UrlRecord {
  originalUrl: string;
  shortCode: string;
  createdAt: string;
}

export interface ShortenRequestPayload {
  url: string;
}

export interface ShortenSuccessResponse {
  shortUrl: string;
  shortCode: string;
}

export interface ApiErrorResponse {
  error: string;
}

export type ShortenApiResponse = ShortenSuccessResponse | ApiErrorResponse;
