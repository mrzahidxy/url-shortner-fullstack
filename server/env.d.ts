declare namespace NodeJS {
  interface ProcessEnv {
    BASE_URL: string;
    DB_NAME?: string;
    MONGO_URI: string;
    PORT?: string;
  }
}
