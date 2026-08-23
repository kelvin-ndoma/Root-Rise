import mongoose, { Schema, type Model, type Types } from "mongoose";
import type { MediaAsset, ProductSpecification } from "@/types";

export interface IProduct {
  name: string;
  slug: string;
  sku: string;
  description: string;
  images: MediaAsset[];
  category: Types.ObjectId;
  price: number;
  compareAtPrice?: number;
  stock: number;
  lowStockThreshold: number;
  hasVariants: boolean;
  isActive: boolean;
  isFeatured: boolean;
  isBestSeller: boolean;
  specifications: ProductSpecification[];
  ratingAverage: number;
  reviewCount: number;
  soldCount: number;
  seoTitle?: string;
  seoDescription?: string;
  createdAt: Date;
  updatedAt: Date;
}

const MediaSchema = new Schema<MediaAsset>(
  {
    url: { type: String, required: true },
    publicId: String,
    alt: String,
  },
  { _id: false },
);

const SpecSchema = new Schema<ProductSpecification>(
  {
    name: { type: String, required: true },
    value: { type: String, required: true },
  },
  { _id: false },
);

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true, maxlength: 180, index: true },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    sku: { type: String, required: true, unique: true, uppercase: true, index: true },
    description: { type: String, required: true },
    images: { type: [MediaSchema], default: [] },
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true, index: true },
    price: { type: Number, required: true, min: 0, index: true },
    compareAtPrice: { type: Number, min: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 },
    lowStockThreshold: { type: Number, default: 5, min: 0 },
    hasVariants: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true, index: true },
    isFeatured: { type: Boolean, default: false, index: true },
    isBestSeller: { type: Boolean, default: false, index: true },
    specifications: { type: [SpecSchema], default: [] },
    ratingAverage: { type: Number, default: 0, min: 0, max: 5, index: true },
    reviewCount: { type: Number, default: 0, min: 0 },
    soldCount: { type: Number, default: 0, min: 0, index: true },
    seoTitle: String,
    seoDescription: String,
  },
  { timestamps: true },
);

ProductSchema.index({ category: 1, isActive: 1, price: 1 });
ProductSchema.index({ isActive: 1, isFeatured: 1, createdAt: -1 });
ProductSchema.index({ isActive: 1, isBestSeller: 1, soldCount: -1 });
ProductSchema.index({ isActive: 1, createdAt: -1 });
ProductSchema.index({ isActive: 1, ratingAverage: -1 });
ProductSchema.index(
  { name: "text", description: "text", sku: "text" },
  { weights: { name: 8, sku: 6, description: 2 }, name: "product_text_search" },
);

export const Product: Model<IProduct> =
  mongoose.models.Product ?? mongoose.model<IProduct>("Product", ProductSchema);
