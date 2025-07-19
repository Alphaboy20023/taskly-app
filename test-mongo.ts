import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config()
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI is not defined");
  process.exit(1);
}

mongoose
  .connect(MONGODB_URI, { dbName: "taskly" })
  .then(() => {
    console.log("✅ Connected to MongoDB");
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Failed to connect to MongoDB:", err);
    process.exit(1);
  });
