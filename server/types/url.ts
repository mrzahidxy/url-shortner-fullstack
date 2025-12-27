import { ObjectId } from "mongodb";

export interface UrlDocument {
  _id?: ObjectId;
  originalUrl: string;
  shortCode: string;
  createdAt: Date;
}
