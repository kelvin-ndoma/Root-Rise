import { connectDB } from "@/lib/db/connect";
import { Category } from "@/models/Category";
import { Product } from "@/models/Product";
import type { ICategory } from "@/models/Category";
import type { Types } from "mongoose";
import type { SerializedCategory } from "@/types";

type LeanCategory = ICategory & { _id: Types.ObjectId };

function serialize(category: LeanCategory, productCount?: number): SerializedCategory {
  return {
    id: category._id.toString(),
    name: category.name,
    slug: category.slug,
    description: category.description,
    image: category.image,
    parentId: category.parent ? category.parent.toString() : null,
    isActive: category.isActive,
    productCount,
  };
}

export async function listActiveCategories() {
  await connectDB();
  const categories = await Category.find({ isActive: true })
    .sort({ sortOrder: 1, name: 1 })
    .lean<LeanCategory[]>();
  return categories.map((category) => serialize(category));
}

export async function getNavCategories() {
  const categories = await listActiveCategories();
  return categories.filter((category) => !category.parentId);
}

export async function getFeaturedCategories(limit = 6) {
  const categories = await getNavCategories();
  return categories.slice(0, limit);
}

export async function getCategoryBySlug(slug: string) {
  await connectDB();
  const category = await Category.findOne({ slug, isActive: true }).lean<LeanCategory | null>();
  if (!category) return null;

  const children = await Category.find({ parent: category._id, isActive: true })
    .select("_id")
    .lean<LeanCategory[]>();
  const ids = [category._id, ...children.map((child) => child._id)];
  const productCount = await Product.countDocuments({
    isActive: true,
    category: { $in: ids },
  });

  return serialize(category, productCount);
}

export async function getChildCategories(parentId: string) {
  await connectDB();
  const children = await Category.find({ parent: parentId, isActive: true })
    .sort({ sortOrder: 1, name: 1 })
    .lean<LeanCategory[]>();
  return children.map((child) => serialize(child));
}
