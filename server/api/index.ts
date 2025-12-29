import express, { Request, Response } from "express";
import cors from "cors";
import shortnerRoutes from "../routes/shortner";
import { HealthResponse } from "../types/api";
import { errorHandler, notFound } from "../middleware/errorHandler";
import { env } from "../config/env";
import {
  closeDatabaseConnection,
  connectToDatabase,
} from "../utils/dbConfig";

const app = express();

app.disable("x-powered-by");
app.set("trust proxy", env.trustProxy);

app.use(express.json({ limit: env.bodyLimit }));
app.use(
  cors({
    origin: env.corsOrigin,
  })
);

app.use("/", shortnerRoutes);

app.get("/api/health", (_req: Request, res: Response<HealthResponse>) => {
  res.status(200).json({
    status: "UP",
    timestamp: new Date().toISOString(),
  });
});

app.use(notFound);
app.use(errorHandler);

let shuttingDown = false;

const startServer = async (): Promise<void> => {
  await connectToDatabase();

  const server = app.listen(env.port, () => {
    console.log(`Service is running on port ${env.port}`);
  });

  const gracefulExit = async (signal: string, error?: unknown) => {
    if (shuttingDown) {
      return;
    }
    shuttingDown = true;

    if (error) {
      console.error(`Shutdown triggered by ${signal}`, error);
    } else {
      console.log(`Shutdown triggered by ${signal}`);
    }

    const timeout = setTimeout(() => {
      console.error("Force exiting after 10 seconds");
      process.exit(1);
    }, 10_000);
    timeout.unref();

    server.close(() => {
      void closeDatabaseConnection().finally(() => {
        process.exit(error ? 1 : 0);
      });
    });
  };

  process.on("SIGTERM", () => {
    void gracefulExit("SIGTERM");
  });
  process.on("SIGINT", () => {
    void gracefulExit("SIGINT");
  });
  process.on("unhandledRejection", (reason) => {
    void gracefulExit("unhandledRejection", reason);
  });
  process.on("uncaughtException", (error) => {
    void gracefulExit("uncaughtException", error);
  });
};

startServer().catch((error) => {
  console.error("Failed to start server", error);
  process.exit(1);
});
