import mongoose, { Schema, type Model, type Types } from "mongoose";
import type { MediaAsset } from "@/types";

export interface ICategory {
  name: string;
  slug: string;
  description?: string;
  image?: MediaAsset;
  parent?: Types.ObjectId | null;
  isActive: boolean;
  sortOrder: number;
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

const CategorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    description: { type: String, maxlength: 2000 },
    image: MediaSchema,
    parent: { type: Schema.Types.ObjectId, ref: "Category", default: null, index: true },
    isActive: { type: Boolean, default: true, index: true },
    sortOrder: { type: Number, default: 0 },
    seoTitle: String,
    seoDescription: String,
  },
  { timestamps: true },
);

CategorySchema.index({ parent: 1, isActive: 1, sortOrder: 1 });
CategorySchema.index({ name: 1 });

export const Category: Model<ICategory> =
  mongoose.models.Category ?? mongoose.model<ICategory>("Category", CategorySchema);
