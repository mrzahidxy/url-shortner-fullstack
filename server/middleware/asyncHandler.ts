import { RequestHandler } from "express";

export const asyncHandler = <
  Params = unknown,
  ResBody = unknown,
  ReqBody = unknown,
  ReqQuery = unknown,
  Locals extends Record<string, unknown> = Record<string, unknown>
>(
  handler: RequestHandler<Params, ResBody, ReqBody, ReqQuery, Locals>
): RequestHandler<Params, ResBody, ReqBody, ReqQuery, Locals> => {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
};
