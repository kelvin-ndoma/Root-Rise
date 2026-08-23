import { z } from "zod";
import { COUPON_TYPES, ORDER_STATUSES, PAYMENT_STATUSES, USER_ROLES } from "@/types";

const emptyToUndefined = (value: unknown) => (value === "" || value === null ? undefined : value);

export const adminListQuerySchema = z.object({
  q: z.string().trim().max(120).optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

export const adminProductListQuerySchema = adminListQuerySchema.extend({
  category: z.string().trim().optional(),
  status: z.enum(["all", "active", "inactive", "low-stock"]).optional().default("all"),
});

export const adminOrderListQuerySchema = adminListQuerySchema.extend({
  status: z.enum(["all", ...ORDER_STATUSES]).optional().default("all"),
  paymentStatus: z.enum(["all", ...PAYMENT_STATUSES]).optional().default("all"),
});

export const adminCustomerListQuerySchema = adminListQuerySchema.extend({
  role: z.enum(["all", ...USER_ROLES]).optional().default("all"),
  status: z.enum(["all", "active", "inactive"]).optional().default("all"),
});

export const adminReviewListQuerySchema = adminListQuerySchema.extend({
  status: z.enum(["all", "pending", "approved"]).optional().default("all"),
});

const mediaSchema = z.object({
  url: z.string().url(),
  publicId: z.string().optional(),
  alt: z.string().optional(),
});

export const productWriteSchema = z.object({
  name: z.string().trim().min(2).max(180),
  sku: z.string().trim().min(2).max(40),
  slug: z.string().trim().max(180).optional(),
  description: z.string().trim().min(8).max(8000),
  categoryId: z.string().min(1, "Choose a category"),
  price: z.coerce.number().min(0),
  compareAtPrice: z.preprocess(emptyToUndefined, z.coerce.number().min(0).optional()),
  stock: z.coerce.number().int().min(0).optional(),
  lowStockThreshold: z.coerce.number().int().min(0).optional(),
  images: z.array(mediaSchema).optional(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  isBestSeller: z.boolean().optional(),
  seoTitle: z.preprocess(emptyToUndefined, z.string().max(180).optional()),
  seoDescription: z.preprocess(emptyToUndefined, z.string().max(300).optional()),
  specifications: z.array(z.object({ name: z.string().trim().min(1), value: z.string().trim().min(1) })).optional(),
});

export const productUpdateSchema = productWriteSchema.partial();

export const categoryWriteSchema = z.object({
  name: z.string().trim().min(2).max(80),
  slug: z.string().trim().max(120).optional(),
  description: z.preprocess(emptyToUndefined, z.string().max(2000).optional()),
  parentId: z.preprocess(emptyToUndefined, z.string().optional()),
  image: mediaSchema.optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.coerce.number().int().optional(),
});

export const categoryUpdateSchema = categoryWriteSchema.partial();

export const orderUpdateSchema = z.object({
  status: z.enum(ORDER_STATUSES).optional(),
  paymentStatus: z.enum(PAYMENT_STATUSES).optional(),
  internalNotes: z.string().max(2000).optional(),
  note: z.string().max(400).optional(),
});

export const customerUpdateSchema = z.object({
  isActive: z.boolean().optional(),
  role: z.enum(USER_ROLES).optional(),
  name: z.string().trim().min(2).max(120).optional(),
  phone: z.preprocess(emptyToUndefined, z.string().max(30).optional()),
});

export const couponWriteSchema = z.object({
  code: z.string().trim().min(3).max(30),
  type: z.enum(COUPON_TYPES),
  value: z.coerce.number().min(0),
  minOrderAmount: z.coerce.number().min(0).optional(),
  startsAt: z.preprocess(emptyToUndefined, z.coerce.date().optional()),
  expiresAt: z.preprocess(emptyToUndefined, z.coerce.date().optional()),
  usageLimit: z.preprocess(emptyToUndefined, z.coerce.number().int().min(1).optional()),
  isActive: z.boolean().optional(),
});

export const couponUpdateSchema = couponWriteSchema.partial();

export const reviewUpdateSchema = z.object({
  isApproved: z.boolean(),
});

export const inventoryAdjustSchema = z.object({
  productId: z.string().min(1),
  variantId: z.preprocess(emptyToUndefined, z.string().optional()),
  quantity: z.coerce.number().int(),
  note: z.preprocess(emptyToUndefined, z.string().max(400).optional()),
});

export const variantStockSchema = z.object({
  stock: z.coerce.number().int().min(0),
});
