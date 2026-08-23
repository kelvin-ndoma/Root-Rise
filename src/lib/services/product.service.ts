import { Types } from "mongoose";
import { connectDB } from "@/lib/db/connect";
import { Category } from "@/models/Category";
import { Product } from "@/models/Product";
import { ProductVariant } from "@/models/ProductVariant";
import type { IProduct } from "@/models/Product";
import type { IProductVariant } from "@/models/ProductVariant";
import type { ICategory } from "@/models/Category";
import { escapeRegex } from "@/lib/utils/slug";
import { getStockStatus } from "@/lib/utils/inventory";
import type { ProductListQuery } from "@/lib/validations/product";
import type {
  ProductListResult,
  SerializedProduct,
  SerializedVariant,
} from "@/types";

type LeanCategory = ICategory & { _id: Types.ObjectId };
type LeanProduct = IProduct & {
  _id: Types.ObjectId;
  category?: LeanCategory | Types.ObjectId;
};
type LeanVariant = IProductVariant & { _id: Types.ObjectId };

function serializeVariant(variant: LeanVariant): SerializedVariant {
  return {
    id: variant._id.toString(),
    sku: variant.sku,
    label: variant.label,
    options: variant.options,
    price: variant.price,
    compareAtPrice: variant.compareAtPrice ?? null,
    stock: variant.stock,
    stockStatus: getStockStatus(variant.stock, variant.lowStockThreshold),
    image: variant.image,
    isActive: variant.isActive,
  };
}

export function serializeProduct(
  product: LeanProduct,
  variants?: LeanVariant[],
): SerializedProduct {
  const category =
    product.category && typeof product.category === "object" && "slug" in product.category
      ? {
          id: product.category._id.toString(),
          name: product.category.name,
          slug: product.category.slug,
        }
      : null;

  const activeVariants = variants?.filter((variant) => variant.isActive) ?? [];
  const stock = activeVariants.length
    ? activeVariants.reduce((sum, variant) => sum + variant.stock, 0)
    : product.stock;
  const threshold = activeVariants[0]?.lowStockThreshold ?? product.lowStockThreshold;

  return {
    id: product._id.toString(),
    name: product.name,
    slug: product.slug,
    sku: product.sku,
    description: product.description,
    images: product.images,
    category,
    price: product.price,
    compareAtPrice: product.compareAtPrice ?? null,
    stock,
    lowStockThreshold: product.lowStockThreshold,
    stockStatus: getStockStatus(stock, threshold),
    hasVariants: product.hasVariants,
    isActive: product.isActive,
    isFeatured: product.isFeatured,
    isBestSeller: product.isBestSeller,
    specifications: product.specifications,
    ratingAverage: product.ratingAverage,
    reviewCount: product.reviewCount,
    soldCount: product.soldCount,
    variants: activeVariants.map(serializeVariant),
    seoTitle: product.seoTitle,
    seoDescription: product.seoDescription,
  };
}

function sortSpec(sort: ProductListQuery["sort"]): Record<string, 1 | -1> {
  switch (sort) {
    case "newest":
      return { createdAt: -1 };
    case "price-asc":
      return { price: 1, createdAt: -1 };
    case "price-desc":
      return { price: -1, createdAt: -1 };
    case "best-selling":
      return { soldCount: -1, createdAt: -1 };
    case "rating":
      return { ratingAverage: -1, reviewCount: -1 };
    default:
      return { isFeatured: -1, isBestSeller: -1, soldCount: -1, createdAt: -1 };
  }
}

async function resolveCategoryId(slugOrId?: string) {
  if (!slugOrId) return undefined;
  const query: Record<string, unknown> = Types.ObjectId.isValid(slugOrId)
    ? { isActive: true, $or: [{ slug: slugOrId }, { _id: slugOrId }] }
    : { isActive: true, slug: slugOrId };
  const category = await Category.findOne(query).select("_id").lean<LeanCategory | null>();
  return category?._id;
}

export async function listProducts(query: ProductListQuery): Promise<ProductListResult> {
  await connectDB();

  const filter: Record<string, unknown> = { isActive: true };
  const categoryId = await resolveCategoryId(query.category);
  if (categoryId) {
    const children = await Category.find({ parent: categoryId, isActive: true })
      .select("_id")
      .lean<LeanCategory[]>();
    const ids = [categoryId, ...children.map((child) => child._id)];
    filter.category = { $in: ids };
  }

  if (query.minPrice != null || query.maxPrice != null) {
    const price: Record<string, number> = {};
    if (query.minPrice != null) price.$gte = query.minPrice;
    if (query.maxPrice != null) price.$lte = query.maxPrice;
    filter.price = price;
  }

  if (query.availability === "in-stock") filter.stock = { $gt: 0 };
  if (query.availability === "out-of-stock") filter.stock = { $lte: 0 };

  if (query.q) {
    const regex = new RegExp(escapeRegex(query.q), "i");
    const matchingCategories = await Category.find({
      isActive: true,
      $or: [{ name: regex }, { slug: regex }],
    })
      .select("_id")
      .lean<LeanCategory[]>();

    filter.$or = [
      { name: regex },
      { description: regex },
      { sku: regex },
      ...(matchingCategories.length
        ? [{ category: { $in: matchingCategories.map((item) => item._id) } }]
        : []),
    ];
  }

  const page = query.page;
  const limit = query.limit;
  const skip = (page - 1) * limit;

  const [rows, total] = await Promise.all([
    Product.find(filter)
      .sort(sortSpec(query.sort))
      .skip(skip)
      .limit(limit)
      .populate("category", "name slug")
      .lean<LeanProduct[]>(),
    Product.countDocuments(filter),
  ]);

  return {
    items: rows.map((row) => serializeProduct(row)),
    total,
    page,
    limit,
    pages: Math.max(1, Math.ceil(total / limit)),
  };
}

export async function getProductBySlug(slug: string) {
  await connectDB();
  const product = await Product.findOne({ slug, isActive: true })
    .populate("category", "name slug")
    .lean<LeanProduct | null>();
  if (!product) return null;

  const variants = await ProductVariant.find({ product: product._id, isActive: true })
    .sort({ price: 1 })
    .lean<LeanVariant[]>();

  return serializeProduct(product, variants);
}

export async function getRelatedProducts(product: SerializedProduct, limit = 4) {
  await connectDB();
  const filter: Record<string, unknown> = {
    isActive: true,
    _id: { $ne: new Types.ObjectId(product.id) },
  };
  if (product.category?.id) {
    filter.category = product.category.id;
  }

  const rows = await Product.find(filter)
    .sort({ soldCount: -1, ratingAverage: -1 })
    .limit(limit)
    .populate("category", "name slug")
    .lean<LeanProduct[]>();

  return rows.map((row) => serializeProduct(row));
}

export async function getNewArrivals(limit = 8) {
  const result = await listProducts({
    sort: "newest",
    page: 1,
    limit,
    availability: "all",
  });
  return result.items;
}

export async function getFeaturedProducts(limit = 8) {
  const result = await listProducts({
    sort: "featured",
    page: 1,
    limit,
    availability: "all",
  });
  return result.items;
}

export async function getBestSellers(limit = 8) {
  await connectDB();
  const rows = await Product.find({ isActive: true, isBestSeller: true })
    .sort({ soldCount: -1, ratingAverage: -1 })
    .limit(limit)
    .populate("category", "name slug")
    .lean<LeanProduct[]>();
  return rows.map((row) => serializeProduct(row));
}

export async function searchSuggestions(q: string, limit = 6) {
  const result = await listProducts({
    q,
    page: 1,
    limit,
    availability: "all",
    sort: "featured",
  });
  return result.items.map((item) => ({
    name: item.name,
    slug: item.slug,
    price: item.price,
    image: item.images[0]?.url,
  }));
}
