import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import productRoutes from "./routes/product.routes";

dotenv.config();

const app = express();

// ─── CORS ─────────────────────────────────────────────────────────────────────
const allowedOrigins = [
    "http://localhost:5173",
    "https://product-management-system-d716n0ht9-sachinabi67-4941s-projects.vercel.app",
    "https://product-management-system-beta-eight.vercel.app",
    "https://product-management-system-gold-chi.vercel.app",
];

app.use(
    cors({
        origin: (origin, callback) => {
            // Allow requests with no origin (e.g. curl, Postman, same-origin)
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                console.warn(`CORS blocked: ${origin}`);
                callback(new Error(`CORS policy: origin '${origin}' is not allowed.`));
            }
        },
        credentials: true,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    })
);

// ─── Body Parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ─── Security: remove X-Powered-By ───────────────────────────────────────────
app.disable("x-powered-by");

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get("/", (req: Request, res: Response) => {
    res.status(200).json({
        status: "ok",
        message: "API is running.",
        timestamp: new Date().toISOString(),
    });
});

app.get("/health", (req: Request, res: Response) => {
    const mongoose = require("mongoose");
    const dbState = ["disconnected", "connected", "connecting", "disconnecting"];
    const readyState = mongoose.connection.readyState;
    res.status(200).json({
        status: readyState === 1 ? "healthy" : "degraded",
        database: dbState[readyState] ?? "unknown",
        uptime: Math.round(process.uptime()),
        timestamp: new Date().toISOString(),
    });
});

// ─── DB Guard Middleware ───────────────────────────────────────────────────────
app.use("/products", (req: Request, res: Response, next: NextFunction) => {
    const mongoose = require("mongoose");
    if (mongoose.connection.readyState !== 1) {
        res.status(503).json({
            error: "Database Unavailable",
            message: "The server is running but cannot reach the database. Please try again shortly.",
            action_required:
                "Ensure MONGO_URI is configured correctly and 0.0.0.0/0 is whitelisted in MongoDB Atlas Network Access.",
        });
        return;
    }
    next();
}, productRoutes);

// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use((req: Request, res: Response) => {
    res.status(404).json({
        error: "Not Found",
        message: `Cannot ${req.method} ${req.originalUrl}`,
    });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    // CORS errors
    if (err.message && err.message.startsWith("CORS policy:")) {
        res.status(403).json({ error: "CORS Error", message: err.message });
        return;
    }

    // JSON parse errors
    if (err.type === "entity.parse.failed") {
        res.status(400).json({ error: "Invalid JSON", message: "The request body contains malformed JSON." });
        return;
    }

    console.error(`[${new Date().toISOString()}] Unhandled error:`, err);

    const status = typeof err.status === "number" ? err.status : 500;
    res.status(status).json({
        error: status === 500 ? "Internal Server Error" : err.message || "An error occurred.",
        message: process.env.NODE_ENV !== "production" ? err.stack?.split("\n")[0] : undefined,
    });
});

export default app;
