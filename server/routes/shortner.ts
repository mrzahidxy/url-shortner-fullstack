import express from "express";
import {
  createShortUrl,
  redirectShortUrl,
} from "../controllers/shortnerController";
import { asyncHandler } from "../middleware/asyncHandler";

const shortnerRoutes = express.Router();

shortnerRoutes.post("/shorten", asyncHandler(createShortUrl));
shortnerRoutes.get("/:shortCode", asyncHandler(redirectShortUrl));

export default shortnerRoutes;
