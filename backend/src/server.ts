import app from "./app";
import { connectDB } from "./db";

const PORT = process.env.PORT || 5000;

export let isDbConnected = false;

const startServer = async () => {
    // Attempt DB connection but DO NOT crash if it fails
    // This allows the Express server to actually start, avoiding 500/502 Bad Gateway timeouts
    isDbConnected = await connectDB();

    // Start listening for requests no matter what
    app.listen(PORT as number, "0.0.0.0", () => {
        console.log(`Server is running on port ${PORT}`);
        if (!isDbConnected) {
            console.warn("==========================================");
            console.warn("⚠️  Server is running, but Database is OFFLINE.");
            console.warn("⚠️  API calls will return JSON errors. Check Render Logs.");
            console.warn("==========================================");
        }
    });
};

startServer();
