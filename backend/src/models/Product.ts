import mongoose, { Document, Schema } from "mongoose";

export interface IProduct extends Document {
    id: number;
    name: string;
    price: number;
    stock: number;
    created_at: Date;
}

const ProductSchema: Schema = new Schema({
    id: { type: Number, unique: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    stock: { type: Number, required: true },
    created_at: { type: Date, default: Date.now },
});

// Auto-increment plugin equivalent using pre-save hook for 'id'
ProductSchema.pre("save", async function () {
    const doc = this;
    if (doc.isNew) {
        const lastProduct = await mongoose.model("Product").findOne().sort({ id: -1 });
        doc.id = lastProduct && lastProduct.id ? lastProduct.id + 1 : 1;
    }
});

export const ProductModel = mongoose.model<IProduct>("Product", ProductSchema);
