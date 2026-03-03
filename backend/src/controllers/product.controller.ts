import { Request, Response } from "express";
import { ProductModel } from "../models/Product";

export const createProduct = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, price, stock } = req.body;

        if (!name || price === undefined || stock === undefined) {
            res.status(400).json({ error: "Name, price, and stock are required fields." });
            return;
        }

        const newProduct = new ProductModel({ name, price, stock });
        await newProduct.save();

        res.status(201).json(newProduct);
    } catch (error) {
        console.error("Error creating product:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getProducts = async (req: Request, res: Response): Promise<void> => {
    try {
        const { search = "", limit = 10, offset = 0, sortBy = "id", sortOrder = "desc" } = req.query;

        const allowedSortColumns = ["id", "name", "price", "stock", "created_at"];
        const allowedSortOrders = ["asc", "desc"];

        const safeSortBy = allowedSortColumns.includes(sortBy as string) ? sortBy : "id";
        const safeSortOrder = allowedSortOrders.includes((sortOrder as string).toLowerCase()) ? sortOrder : "desc";
        const sortMultiplier = safeSortOrder === "asc" ? 1 : -1;

        const query: any = {};
        if (search) {
            query.name = { $regex: new RegExp(search as string, "i") };
        }

        const total = await ProductModel.countDocuments(query);
        const products = await ProductModel.find(query)
            .sort({ [safeSortBy as string]: sortMultiplier })
            .skip(Number(offset))
            .limit(Number(limit));

        res.status(200).json({
            data: products.map(p => ({
                id: p.id,
                name: p.name,
                price: p.price,
                stock: p.stock,
                created_at: p.created_at
            })),
            total,
            limit: Number(limit),
            offset: Number(offset)
        });
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const updateProduct = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { name, price, stock } = req.body;

        if (!name || price === undefined || stock === undefined) {
            res.status(400).json({ error: "Name, price, and stock are required fields." });
            return;
        }

        const updatedProduct = await ProductModel.findOneAndUpdate(
            { id: Number(id) },
            { name, price, stock },
            { new: true }
        );

        if (!updatedProduct) {
            res.status(404).json({ error: "Product not found." });
            return;
        }

        res.status(200).json({
            id: updatedProduct.id,
            name: updatedProduct.name,
            price: updatedProduct.price,
            stock: updatedProduct.stock,
            created_at: updatedProduct.created_at
        });
    } catch (error) {
        console.error("Error updating product:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const deletedProduct = await ProductModel.findOneAndDelete({ id: Number(id) });

        if (!deletedProduct) {
            res.status(404).json({ error: "Product not found." });
            return;
        }

        res.status(200).json({ message: "Product deleted successfully", id: Number(id) });
    } catch (error) {
        console.error("Error deleting product:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
