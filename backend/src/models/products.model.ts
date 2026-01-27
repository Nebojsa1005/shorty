import { Schema, model, Document } from "mongoose";

export interface ProductDocument extends Document {
  productId: string;
  maxLinks: number;
}


const productSchema = new Schema<ProductDocument>({
  productId: { type: String, required: true },
  maxLinks: { type: Number, required: true },
});

export const ProductsModel = model<ProductDocument>("Products", productSchema);