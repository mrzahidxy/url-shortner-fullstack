import { ErrorRequestHandler, RequestHandler } from "express";

export class HttpError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
  }
}

export const notFound: RequestHandler = (_req, res) => {
  res.status(404).json({ error: "Route not found" });
};

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  const statusCode =
    err instanceof HttpError && err.statusCode ? err.statusCode : 500;
  const message =
    err instanceof Error ? err.message : "Internal server error";

  res.status(statusCode).json({ error: message });
};
