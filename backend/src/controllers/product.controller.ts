import { Request, Response } from "express";
import { pool } from "../db";

export const createProduct = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, price, stock } = req.body;

        if (!name || price === undefined || stock === undefined) {
            res.status(400).json({ error: "Name, price, and stock are required fields." });
            return;
        }

        const result = await pool.query(
            "INSERT INTO products (name, price, stock) VALUES ($1, $2, $3) RETURNING *",
            [name, price, stock]
        );

        res.status(201).json(result.rows[0]);
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

        const countQuery = `
            SELECT COUNT(*) 
            FROM products 
            WHERE name ILIKE $1
        `;

        const dataQuery = `
            SELECT * 
            FROM products 
            WHERE name ILIKE $1 
            ORDER BY ${safeSortBy} ${safeSortOrder} 
            LIMIT $2 OFFSET $3
        `;

        const searchValue = `%${search}%`;

        const countResult = await pool.query(countQuery, [searchValue]);
        const total = parseInt(countResult.rows[0].count);

        const dataResult = await pool.query(dataQuery, [searchValue, limit, offset]);

        res.status(200).json({
            data: dataResult.rows,
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

        const result = await pool.query(
            "UPDATE products SET name = $1, price = $2, stock = $3 WHERE id = $4 RETURNING *",
            [name, price, stock, id]
        );

        if (result.rowCount === 0) {
            res.status(404).json({ error: "Product not found." });
            return;
        }

        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error("Error updating product:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const result = await pool.query("DELETE FROM products WHERE id = $1 RETURNING id", [id]);

        if (result.rowCount === 0) {
            res.status(404).json({ error: "Product not found." });
            return;
        }

        res.status(200).json({ message: "Product deleted successfully", id });
    } catch (error) {
        console.error("Error deleting product:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
