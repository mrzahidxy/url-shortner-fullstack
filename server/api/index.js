// Import dependencies
require('dotenv').config();
const express = require("express");
const cors = require("cors");

// Import routes
const shortnerRouter = require("../route/shortner");

// Initialize the app
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use("/", shortnerRouter);

// Health Check Endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "UP",
    timestamp: new Date(),
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Service is running!`);
});
