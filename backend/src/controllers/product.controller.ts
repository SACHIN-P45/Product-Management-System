import { Request, Response } from "express";
import { ProductModel } from "../models/Product";

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Sanitise and validate a positive finite number */
const parsePositiveNumber = (value: unknown, fieldName: string): { value: number } | { error: string } => {
    const num = Number(value);
    if (value === undefined || value === null || value === "") return { error: `${fieldName} is required.` };
    if (isNaN(num) || !isFinite(num)) return { error: `${fieldName} must be a valid number.` };
    if (num < 0) return { error: `${fieldName} cannot be negative.` };
    return { value: num };
};

// ─── Create Product ───────────────────────────────────────────────────────────
export const createProduct = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, price, stock } = req.body;
        const validationErrors: string[] = [];

        // Name validation
        if (!name || typeof name !== "string") {
            validationErrors.push("Product name is required.");
        } else if (name.trim().length < 2) {
            validationErrors.push("Product name must be at least 2 characters.");
        } else if (name.trim().length > 100) {
            validationErrors.push("Product name must not exceed 100 characters.");
        }

        // Price validation
        const parsedPrice = parsePositiveNumber(price, "Price");
        if ("error" in parsedPrice) validationErrors.push(parsedPrice.error);
        else if (parsedPrice.value > 1_000_000) validationErrors.push("Price cannot exceed $1,000,000.");

        // Stock validation
        const parsedStock = parsePositiveNumber(stock, "Stock");
        if ("error" in parsedStock) validationErrors.push(parsedStock.error);
        else if (!("error" in parsedStock) && !Number.isInteger(parsedStock.value)) {
            validationErrors.push("Stock must be a whole number.");
        } else if (!("error" in parsedStock) && parsedStock.value > 1_000_000) {
            validationErrors.push("Stock cannot exceed 1,000,000.");
        }

        if (validationErrors.length > 0) {
            res.status(400).json({
                error: "Validation failed",
                details: validationErrors,
            });
            return;
        }

        const newProduct = new ProductModel({
            name: (name as string).trim(),
            price: (parsedPrice as { value: number }).value,
            stock: (parsedStock as { value: number }).value,
        });
        await newProduct.save();

        res.status(201).json({
            id: newProduct.id,
            name: newProduct.name,
            price: newProduct.price,
            stock: newProduct.stock,
            created_at: newProduct.created_at,
        });
    } catch (error: any) {
        console.error("Error creating product:", error);
        if (error.name === "ValidationError") {
            res.status(400).json({ error: "Validation error", details: Object.values(error.errors).map((e: any) => e.message) });
            return;
        }
        res.status(500).json({ error: "Internal server error. Please try again later." });
    }
};

// ─── Get Products ─────────────────────────────────────────────────────────────
export const getProducts = async (req: Request, res: Response): Promise<void> => {
    try {
        const { search = "", limit = 10, offset = 0, sortBy = "id", sortOrder = "desc" } = req.query;

        const allowedSortColumns = ["id", "name", "price", "stock", "created_at"];
        const allowedSortOrders = ["asc", "desc"];

        const safeSortBy = allowedSortColumns.includes(sortBy as string) ? (sortBy as string) : "id";
        const safeSortOrder = allowedSortOrders.includes((sortOrder as string).toLowerCase()) ? sortOrder : "desc";
        const sortMultiplier = safeSortOrder === "asc" ? 1 : -1;

        const parsedLimit = Math.min(Math.max(Number(limit) || 10, 1), 100);
        const parsedOffset = Math.max(Number(offset) || 0, 0);

        if (isNaN(parsedLimit) || isNaN(parsedOffset)) {
            res.status(400).json({ error: "Invalid pagination parameters." });
            return;
        }

        const query: any = {};
        if (search) {
            query.name = { $regex: new RegExp((search as string).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), "i") };
        }

        const [total, products] = await Promise.all([
            ProductModel.countDocuments(query),
            ProductModel.find(query)
                .sort({ [safeSortBy]: sortMultiplier })
                .skip(parsedOffset)
                .limit(parsedLimit),
        ]);

        res.status(200).json({
            data: products.map(p => ({
                id: p.id,
                name: p.name,
                price: p.price,
                stock: p.stock,
                created_at: p.created_at,
            })),
            total,
            limit: parsedLimit,
            offset: parsedOffset,
        });
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({ error: "Internal server error. Please try again later." });
    }
};

// ─── Update Product ───────────────────────────────────────────────────────────
export const updateProduct = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        if (!id || isNaN(Number(id))) {
            res.status(400).json({ error: "Invalid product ID." });
            return;
        }

        const { name, price, stock } = req.body;
        const validationErrors: string[] = [];

        if (!name || typeof name !== "string") {
            validationErrors.push("Product name is required.");
        } else if (name.trim().length < 2) {
            validationErrors.push("Product name must be at least 2 characters.");
        } else if (name.trim().length > 100) {
            validationErrors.push("Product name must not exceed 100 characters.");
        }

        const parsedPrice = parsePositiveNumber(price, "Price");
        if ("error" in parsedPrice) validationErrors.push(parsedPrice.error);
        else if (parsedPrice.value > 1_000_000) validationErrors.push("Price cannot exceed $1,000,000.");

        const parsedStock = parsePositiveNumber(stock, "Stock");
        if ("error" in parsedStock) validationErrors.push(parsedStock.error);
        else if (!("error" in parsedStock) && !Number.isInteger(parsedStock.value)) {
            validationErrors.push("Stock must be a whole number.");
        }

        if (validationErrors.length > 0) {
            res.status(400).json({ error: "Validation failed", details: validationErrors });
            return;
        }

        const updatedProduct = await ProductModel.findOneAndUpdate(
            { id: Number(id) },
            {
                name: (name as string).trim(),
                price: (parsedPrice as { value: number }).value,
                stock: (parsedStock as { value: number }).value,
            },
            { new: true, runValidators: true }
        );

        if (!updatedProduct) {
            res.status(404).json({ error: `Product with ID ${id} not found.` });
            return;
        }

        res.status(200).json({
            id: updatedProduct.id,
            name: updatedProduct.name,
            price: updatedProduct.price,
            stock: updatedProduct.stock,
            created_at: updatedProduct.created_at,
        });
    } catch (error: any) {
        console.error("Error updating product:", error);
        if (error.name === "ValidationError") {
            res.status(400).json({ error: "Validation error", details: Object.values(error.errors).map((e: any) => e.message) });
            return;
        }
        res.status(500).json({ error: "Internal server error. Please try again later." });
    }
};

// ─── Delete Product ───────────────────────────────────────────────────────────
export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        if (!id || isNaN(Number(id))) {
            res.status(400).json({ error: "Invalid product ID." });
            return;
        }

        const deletedProduct = await ProductModel.findOneAndDelete({ id: Number(id) });

        if (!deletedProduct) {
            res.status(404).json({ error: `Product with ID ${id} not found.` });
            return;
        }

        res.status(200).json({ message: "Product deleted successfully.", id: Number(id) });
    } catch (error) {
        console.error("Error deleting product:", error);
        res.status(500).json({ error: "Internal server error. Please try again later." });
    }
};
