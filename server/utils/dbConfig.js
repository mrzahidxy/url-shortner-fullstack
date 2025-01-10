const { MongoClient } = require("mongodb");

const uri = process.env.MONGO_URI; 
const client = new MongoClient(uri);

let db;

const connectToDatabase = async () => {
  if (!db) {
    try {
      await client.connect();
      db = client.db(process.env.DB_NAME || "urlShortener");
      console.log("Connected to MongoDB Atlas");
    } catch (err) {
      console.error("Failed to connect to MongoDB", err);
      process.exit(1);
    }
  }
  return db;
};

module.exports = { connectToDatabase };
