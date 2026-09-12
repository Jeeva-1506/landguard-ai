import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export const connectDB = async (): Promise<boolean> => {
  const uri = process.env.MONGODB_URI;
  if (!uri || uri.trim() === "") {
    console.warn("⚠️ MONGODB_URI environment variable is not defined. Disabling Mongoose query buffering for instant fallback data mode.");
    mongoose.set('bufferCommands', false);
    return false;
  }

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log("✅ Successfully connected to MongoDB Atlas");
    return true;
  } catch (error: any) {
    console.error("❌ MongoDB connection error:", error.message || error);
    console.warn("⚠️ Disabling Mongoose query buffering for hybrid JSON/in-memory data fallback mode.");
    mongoose.set('bufferCommands', false);
    return false;
  }
};
