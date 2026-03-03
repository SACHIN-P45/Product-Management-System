import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import productRoutes from "./routes/product.routes";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
    res.status(200).send("API is running!");
});

app.use("/products", productRoutes);

// Global error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ error: "Something went wrong!" });
});

export default app;
