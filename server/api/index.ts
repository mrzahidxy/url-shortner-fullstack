import "dotenv/config";
import express, { Request, Response } from "express";
import cors from "cors";
import shortnerRouter from "../route/shortner";
import { HealthResponse } from "../types/api";

const app = express();

app.use(express.json());
app.use(cors());

app.use("/", shortnerRouter);

app.get("/api/health", (_req: Request, res: Response<HealthResponse>) => {
  res.status(200).json({
    status: "UP",
    timestamp: new Date().toISOString(),
  });
});

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

app.listen(PORT, () => {
  console.log(`Service is running on port ${PORT}`);
});
