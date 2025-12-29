import "dotenv/config";
import express, { Request, Response } from "express";
import cors from "cors";
import shortnerRoutes from "../routes/shortner";
import { HealthResponse } from "../types/api";
import { errorHandler, notFound } from "../middleware/errorHandler";

const app = express();

app.use(express.json());
app.use(cors());

app.use("/", shortnerRoutes);

app.get("/api/health", (_req: Request, res: Response<HealthResponse>) => {
  res.status(200).json({
    status: "UP",
    timestamp: new Date().toISOString(),
  });
});

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

app.listen(PORT, () => {
  console.log(`Service is running on port ${PORT}`);
});
