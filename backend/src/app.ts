import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import productRoutes from "./routes/product.routes";

dotenv.config();

const app = express();

app.use(cors({
    origin: [
        'http://localhost:5173',
        'https://product-management-system-d716n0ht9-sachinabi67-4941s-projects.vercel.app',
        'https://product-management-system-beta-eight.vercel.app',
        'https://product-management-system-gold-chi.vercel.app' // Added new Vercel domain
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
    res.status(200).send("API is running!");
});

// Middleware to check database connection BEFORE processing product routes
app.use("/products", (req: Request, res: Response, next: NextFunction) => {
    const mongoose = require("mongoose");
    if (mongoose.connection.readyState !== 1) {
        res.status(500).json({
            error: "Database Connection Failed",
            message: "The backend server is running, but it cannot connect to MongoDB.",
            action_required: "1. Ensure 'MONGO_URI' is set in Render Environment Variables. 2. Ensure '0.0.0.0/0' is added to MongoDB Atlas Network Access whitelist.",
        });
        return;
    }
    next();
}, productRoutes);

// Global error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ error: "Something went wrong!" });
});

export default app;
