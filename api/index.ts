import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

let isDbConnected = false;
async function connectDB() {
  if (isDbConnected) return;
  const mongoUri = process.env.MONGODB_URI;
  if (mongoUri) {
    try {
      await mongoose.connect(mongoUri);
      isDbConnected = true;
      console.log('Connected to MongoDB Cloud');
    } catch (err) {
      console.error('Failed to connect to MongoDB:', err);
    }
  }
}

// Ensure DB is connected before handling API requests
app.use(async (req, res, next) => {
  await connectDB();
  next();
});

// API Routes
app.get("/api/health", (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.json({ status: "ok", database: dbStatus });
});

// We export the configured Express app
// Vercel Serverless Function will use this to resolve requests
export default app;
