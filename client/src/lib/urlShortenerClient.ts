import type {
  ApiErrorResponse,
  ShortenRequestPayload,
  ShortenSuccessResponse,
} from "../types/api";

export interface ShortenResult {
  shortUrl: string;
  shortCode: string;
}

export interface FollowResult {
  shortUrl: string;
  finalUrl: string;
}

const normalizeBaseUrl = (baseUrl: string): string => {
  const trimmed = baseUrl.trim();
  if (!trimmed) {
    throw new Error("API base URL is not configured");
  }
  return trimmed.replace(/\/+$/, "");
};

const readErrorMessage = async (response: Response): Promise<string | null> => {
  try {
    const payload = (await response.json()) as ApiErrorResponse;
    if (payload && typeof payload.error === "string") {
      return payload.error;
    }
  } catch {
    return null;
  }

  return null;
};

export const getShortCodeFromUrl = (shortUrl: string): string => {
  const parsed = new URL(shortUrl);
  const segments = parsed.pathname.split("/").filter(Boolean);
  const shortCode = segments[segments.length - 1];
  if (!shortCode) {
    throw new Error("Short URL does not contain a shortcode");
  }
  return shortCode;
};

export const createUrlShortenerClient = (
  baseUrl: string,
  fetcher: typeof fetch = fetch
) => {
  const normalizedBaseUrl = normalizeBaseUrl(baseUrl);
  const buildUrl = (path: string): string =>
    `${normalizedBaseUrl}/${path.replace(/^\/+/, "")}`;

  const shortenUrl = async (url: string): Promise<ShortenResult> => {
    if (!url.trim()) {
      throw new Error("URL is required");
    }

    const payload: ShortenRequestPayload = { url: url.trim() };

    const response = await fetcher(buildUrl("shorten"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const message = (await readErrorMessage(response)) || response.statusText;
      throw new Error(message || "Failed to shorten URL");
    }

    const data = (await response.json()) as ShortenSuccessResponse;
    const shortUrl = data.shortUrl?.trim();
    const shortCode = data.shortCode?.trim();

    if (!shortUrl || !shortCode) {
      throw new Error("Shorten response missing shortUrl or shortCode");
    }

    return { shortUrl, shortCode };
  };

  const followShortCode = async (shortCode: string): Promise<FollowResult> => {
    if (!shortCode.trim()) {
      throw new Error("Shortcode is required");
    }

    const shortUrl = buildUrl(shortCode);
    const response = await fetcher(shortUrl, {
      method: "GET",
      redirect: "follow",
    });

    if (!response.ok) {
      const message = (await readErrorMessage(response)) || response.statusText;
      throw new Error(message || "Failed to follow short URL");
    }

    return {
      shortUrl,
      finalUrl: response.url || shortUrl,
    };
  };

  return {
    shortenUrl,
    followShortCode,
  };
};
