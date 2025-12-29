export interface ShortenRequestBody {
  url: string;
}

export interface ShortenResponse {
  shortUrl: string;
  shortCode: string;
}

export interface ErrorResponse {
  error: string;
}

export interface ShortCodeParams {
  shortCode: string;
}

export interface HealthResponse {
  status: string;
  timestamp: string;
}
