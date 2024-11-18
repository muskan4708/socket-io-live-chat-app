import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const Connection = async (): Promise<void> => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URL as string);
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection error:", err);
  }
};

export default Connection;
