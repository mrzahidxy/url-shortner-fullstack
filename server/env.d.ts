declare namespace NodeJS {
  interface ProcessEnv {
    BASE_URL: string;
    BODY_LIMIT?: string;
    CORS_ORIGIN?: string;
    DB_NAME?: string;
    MONGO_URI: string;
    NODE_ENV?: "development" | "production" | "test";
    PORT?: string;
    TRUST_PROXY?: string;
  }
}
