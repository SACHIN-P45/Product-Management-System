import app from "./app";
import { connectDB } from "./db";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        // Connect to MongoDB first
        await connectDB();

        // Then start listening for requests
        app.listen(PORT as number, "0.0.0.0", () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
};

startServer();
