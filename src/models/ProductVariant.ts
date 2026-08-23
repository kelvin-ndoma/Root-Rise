import mongoose, { Schema, type Model, type Types } from "mongoose";
import type { MediaAsset, VariantOption } from "@/types";

export interface IProductVariant {
  product: Types.ObjectId;
  sku: string;
  label: string;
  options: VariantOption[];
  price: number;
  compareAtPrice?: number;
  stock: number;
  lowStockThreshold: number;
  image?: MediaAsset;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const OptionSchema = new Schema<VariantOption>(
  {
    name: { type: String, required: true },
    value: { type: String, required: true },
  },
  { _id: false },
);

const MediaSchema = new Schema<MediaAsset>(
  {
    url: { type: String, required: true },
    publicId: String,
    alt: String,
  },
  { _id: false },
);

const ProductVariantSchema = new Schema<IProductVariant>(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true, index: true },
    sku: { type: String, required: true, unique: true, uppercase: true, index: true },
    label: { type: String, required: true },
    options: { type: [OptionSchema], default: [] },
    price: { type: Number, required: true, min: 0 },
    compareAtPrice: { type: Number, min: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 },
    lowStockThreshold: { type: Number, default: 5, min: 0 },
    image: MediaSchema,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

ProductVariantSchema.index({ product: 1, isActive: 1 });

export const ProductVariant: Model<IProductVariant> =
  mongoose.models.ProductVariant ??
  mongoose.model<IProductVariant>("ProductVariant", ProductVariantSchema);
