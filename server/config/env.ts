import "dotenv/config";

type NodeEnv = "development" | "production" | "test";

const requiredEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`${key} environment variable is not set`);
  }
  return value;
};

const parsePort = (value: string | undefined): number => {
  if (!value) {
    return 3000;
  }

  const port = Number(value);
  if (!Number.isInteger(port) || port <= 0 || port > 65535) {
    throw new Error("PORT must be a valid port number");
  }
  return port;
};

const parseBoolean = (value: string | undefined, fallback: boolean): boolean => {
  if (value === undefined) {
    return fallback;
  }
  const normalized = value.trim().toLowerCase();
  if (["true", "1", "yes"].includes(normalized)) {
    return true;
  }
  if (["false", "0", "no"].includes(normalized)) {
    return false;
  }
  throw new Error("TRUST_PROXY must be a boolean-like value");
};

const normalizeBaseUrl = (value: string): string => {
  const normalized = value.replace(/\/+$/, "");
  const parsed = new URL(normalized);

  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new Error("BASE_URL must start with http:// or https://");
  }

  return normalized;
};

const parseCorsOrigin = (
  value: string | undefined,
  env: NodeEnv
): string | string[] | boolean => {
  if (!value || value.trim() === "") {
    return env === "production" ? false : true;
  }

  const trimmed = value.trim();
  if (trimmed === "*") {
    return "*";
  }

  const origins = trimmed
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (origins.length === 1) {
    return origins[0];
  }

  return origins;
};

const resolveNodeEnv = (): NodeEnv => {
  const rawEnv = process.env.NODE_ENV ?? "development";
  if (rawEnv === "development" || rawEnv === "production" || rawEnv === "test") {
    return rawEnv;
  }
  throw new Error("NODE_ENV must be development, production, or test");
};

const nodeEnv = resolveNodeEnv();

export const env = {
  nodeEnv,
  port: parsePort(process.env.PORT),
  baseUrl: normalizeBaseUrl(requiredEnv("BASE_URL")),
  mongoUri: requiredEnv("MONGO_URI"),
  dbName: process.env.DB_NAME ?? "urlShortener",
  corsOrigin: parseCorsOrigin(process.env.CORS_ORIGIN, nodeEnv),
  trustProxy: parseBoolean(process.env.TRUST_PROXY, false),
  bodyLimit: process.env.BODY_LIMIT ?? "1mb",
};
