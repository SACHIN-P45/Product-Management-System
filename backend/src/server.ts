import app from "./app";
import { connectDB } from "./db";

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
    try {
        await connectDB();
        console.log(`Server is running on port ${PORT}`);
    } catch (error) {
        console.error("Failed to start server:", error);
    }
});
