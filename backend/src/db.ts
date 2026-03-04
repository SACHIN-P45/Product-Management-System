import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export const connectDB = async (): Promise<boolean> => {
    try {
        const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/product_management";
        // Explicitly set a 5-second timeout so it doesn't hang forever
        await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
        console.log("MongoDB connected successfully");
        return true;
    } catch (error) {
        console.error("==========================================");
        console.error("🚨 MongoDB connection failed!");
        console.error("1. Did you set MONGO_URI in Render Environment Variables?");
        console.error("2. Did you whitelist 0.0.0.0/0 in MongoDB Atlas Network Access?");
        console.error("Error details:", (error as Error).message);
        console.error("==========================================");
        return false;
    }
};
