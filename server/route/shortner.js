const express = require("express");
const { isValidUrl, generateShortCode } = require("../utils/common-method");
const { connectToDatabase } = require("../utils/dbConfig");

const shortnerRouter = express.Router();

// Configuration
const BASE_URL = process.env.BASE_URL;

// POST /shorten
shortnerRouter.post("/shorten", async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }

  if (!isValidUrl(url)) {
    return res.status(400).json({ error: "Invalid URL format" });
  }

  try {
    const db = await connectToDatabase();
    const collection = db.collection("urls");

    // Check if the URL already exists
    const existing = await collection.findOne({ originalUrl: url });

    if (existing) {
      return res
        .status(200)
        .json({ shortUrl: `${BASE_URL}/${existing.shortCode}` });
    }

    // Generate a unique short code
    let shortCode;
    do {
      shortCode = generateShortCode();
    } while (await collection.findOne({ shortCode }));

    // Save to database
    const newEntry = { shortCode, originalUrl: url, createdAt: new Date() };
    await collection.insertOne(newEntry);

    return res.status(201).json({ shortUrl: `${BASE_URL}/${shortCode}` });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// GET /:shortCode
shortnerRouter.get("/:shortCode", async (req, res) => {
  const { shortCode } = req.params;

  try {
    const db = await connectToDatabase();
    const collection = db.collection("urls");

    // Find the URL by short code
    const entry = await collection.findOne({ shortCode });
    
    if (!entry) {
      return res.status(404).json({ error: "Short URL not found" });
    }

    // Redirect to the original URL
    return res.redirect(entry.originalUrl);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = shortnerRouter;
