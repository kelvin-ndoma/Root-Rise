import { Types } from "mongoose";
import { connectDB } from "@/lib/db/connect";
import { Category } from "@/models/Category";
import { Coupon } from "@/models/Coupon";
import { InventoryTransaction } from "@/models/InventoryTransaction";
import { Order } from "@/models/Order";
import { OrderItem } from "@/models/OrderItem";
import { Payment } from "@/models/Payment";
import { Product } from "@/models/Product";
import { ProductVariant } from "@/models/ProductVariant";
import { Review } from "@/models/Review";
import { User } from "@/models/User";
import { serializeProduct } from "@/lib/services/product.service";
import { slugify, escapeRegex } from "@/lib/utils/slug";
import { getStockStatus } from "@/lib/utils/inventory";
import { siteConfig } from "@/config/site";
import type {
  ICategory,
} from "@/models/Category";
import type { IProduct } from "@/models/Product";
import type { IProductVariant } from "@/models/ProductVariant";
import type { IOrder } from "@/models/Order";
import type { IOrderItem } from "@/models/OrderItem";
import type { IUser } from "@/models/User";
import type { ICoupon } from "@/models/Coupon";
import type { IReview } from "@/models/Review";
import type { IPayment } from "@/models/Payment";
import type { IInventoryTransaction } from "@/models/InventoryTransaction";
import type { OrderStatus, PaymentStatus, SerializedProduct, UserRole } from "@/types";
import type {
  adminCustomerListQuerySchema,
  adminOrderListQuerySchema,
  adminProductListQuerySchema,
  adminReviewListQuerySchema,
  categoryWriteSchema,
  couponWriteSchema,
  customerUpdateSchema,
  inventoryAdjustSchema,
  orderUpdateSchema,
  productWriteSchema,
} from "@/lib/validations/admin";
import type { z } from "zod";

type LeanProduct = IProduct & { _id: Types.ObjectId; category?: ICategory & { _id: Types.ObjectId } };
type LeanVariant = IProductVariant & { _id: Types.ObjectId };
type LeanCategory = ICategory & { _id: Types.ObjectId };
type LeanOrder = IOrder & { _id: Types.ObjectId };
type LeanOrderItem = IOrderItem & { _id: Types.ObjectId };
type LeanUser = IUser & { _id: Types.ObjectId };
type LeanCoupon = ICoupon & { _id: Types.ObjectId };
type LeanReview = IReview & {
  _id: Types.ObjectId;
  user?: Pick<IUser, "name" | "email"> & { _id: Types.ObjectId };
  product?: Pick<IProduct, "name" | "slug"> & { _id: Types.ObjectId };
};
type LeanPayment = IPayment & { _id: Types.ObjectId };
type LeanInventory = IInventoryTransaction & {
  _id: Types.ObjectId;
  product?: Pick<IProduct, "name" | "sku"> & { _id: Types.ObjectId };
};

async function uniqueValue(
  model: { exists: (filter: Record<string, unknown>) => Promise<unknown> },
  field: string,
  value: string,
  excludeId?: string,
) {
  let candidate = value;
  let n = 1;
  while (
    await model.exists({
      [field]: candidate,
      ...(excludeId ? { _id: { $ne: excludeId } } : {}),
    })
  ) {
    candidate = `${value}-${n++}`;
  }
  return candidate;
}

function objectId(id: string) {
  if (!Types.ObjectId.isValid(id)) throw new Error("Invalid id.");
  return new Types.ObjectId(id);
}

export async function listAdminProducts(query: z.infer<typeof adminProductListQuerySchema>) {
  await connectDB();
  const filter: Record<string, unknown> = {};
  if (query.category) filter.category = objectId(query.category);
  if (query.status === "active") filter.isActive = true;
  if (query.status === "inactive") filter.isActive = false;
  if (query.status === "low-stock") {
    filter.isActive = true;
    filter.$expr = { $lte: ["$stock", "$lowStockThreshold"] };
  }
  if (query.q) {
    const regex = new RegExp(escapeRegex(query.q), "i");
    filter.$or = [{ name: regex }, { sku: regex }, { slug: regex }];
  }

  const skip = (query.page - 1) * query.limit;
  const [rows, total] = await Promise.all([
    Product.find(filter)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(query.limit)
      .populate("category", "name slug")
      .lean<LeanProduct[]>(),
    Product.countDocuments(filter),
  ]);

  const variantProducts = rows.filter((row) => row.hasVariants).map((row) => row._id);
  const variantTotals = variantProducts.length
    ? await ProductVariant.aggregate<{ _id: Types.ObjectId; stock: number }>([
        { $match: { product: { $in: variantProducts } } },
        { $group: { _id: "$product", stock: { $sum: "$stock" } } },
      ])
    : [];
  const variantStock = new Map(variantTotals.map((item) => [item._id.toString(), item.stock]));

  return {
    items: rows.map((row) => {
      const serialized = serializeProduct(row);
      const stock = row.hasVariants ? (variantStock.get(row._id.toString()) ?? 0) : serialized.stock;
      return { ...serialized, stock, stockStatus: getStockStatus(stock, row.lowStockThreshold) };
    }),
    total,
    page: query.page,
    limit: query.limit,
    pages: Math.max(1, Math.ceil(total / query.limit)),
  };
}

export async function getAdminProduct(id: string): Promise<SerializedProduct | null> {
  await connectDB();
  const product = await Product.findById(id).populate("category", "name slug").lean<LeanProduct | null>();
  if (!product) return null;
  const variants = await ProductVariant.find({ product: product._id }).sort({ price: 1 }).lean<LeanVariant[]>();
  return serializeProduct(product, variants);
}

export async function createAdminProduct(input: z.infer<typeof productWriteSchema>) {
  await connectDB();
  const category = await Category.findById(input.categoryId);
  if (!category) throw new Error("Category not found.");

  const slug = await uniqueValue(Product, "slug", slugify(input.slug || input.name));
  const sku = await uniqueValue(Product, "sku", input.sku.trim().toUpperCase());

  const product = await Product.create({
    name: input.name,
    slug,
    sku,
    description: input.description,
    images: input.images ?? [],
    category: category._id,
    price: input.price,
    compareAtPrice: input.compareAtPrice,
    stock: input.stock ?? 0,
    lowStockThreshold: input.lowStockThreshold ?? 5,
    hasVariants: false,
    isActive: input.isActive ?? true,
    isFeatured: input.isFeatured ?? false,
    isBestSeller: input.isBestSeller ?? false,
    specifications: input.specifications?.length
      ? input.specifications
      : [{ name: "Brand", value: siteConfig.name }],
    seoTitle: input.seoTitle || `${input.name} | ${siteConfig.name}`,
    seoDescription: input.seoDescription || input.description.slice(0, 150),
  });

  return getAdminProduct(product._id.toString());
}

export async function updateAdminProduct(id: string, input: Partial<z.infer<typeof productWriteSchema>>) {
  await connectDB();
  const product = await Product.findById(id);
  if (!product) throw new Error("Product not found.");

  if (input.categoryId) {
    const category = await Category.findById(input.categoryId);
    if (!category) throw new Error("Category not found.");
    product.category = category._id;
  }
  if (input.name) product.name = input.name;
  if (input.description) product.description = input.description;
  if (input.price != null) product.price = input.price;
  if (input.compareAtPrice !== undefined) product.compareAtPrice = input.compareAtPrice;
  if (input.stock != null && !product.hasVariants) product.stock = input.stock;
  if (input.lowStockThreshold != null) product.lowStockThreshold = input.lowStockThreshold;
  if (input.images) product.images = input.images;
  if (input.isActive != null) product.isActive = input.isActive;
  if (input.isFeatured != null) product.isFeatured = input.isFeatured;
  if (input.isBestSeller != null) product.isBestSeller = input.isBestSeller;
  if (input.specifications) product.specifications = input.specifications;
  if (input.seoTitle !== undefined) product.seoTitle = input.seoTitle;
  if (input.seoDescription !== undefined) product.seoDescription = input.seoDescription;
  if (input.sku) product.sku = await uniqueValue(Product, "sku", input.sku.trim().toUpperCase(), id);
  if (input.slug || input.name) {
    product.slug = await uniqueValue(Product, "slug", slugify(input.slug || input.name || product.name), id);
  }

  await product.save();
  return getAdminProduct(id);
}

export async function listAdminCategories() {
  await connectDB();
  const categories = await Category.find().sort({ sortOrder: 1, name: 1 }).lean<LeanCategory[]>();
  const counts = await Product.aggregate<{ _id: Types.ObjectId; count: number }>([
    { $group: { _id: "$category", count: { $sum: 1 } } },
  ]);
  const countMap = new Map(counts.map((item) => [item._id.toString(), item.count]));
  return categories.map((category) => ({
    id: category._id.toString(),
    name: category.name,
    slug: category.slug,
    description: category.description,
    image: category.image,
    parentId: category.parent ? category.parent.toString() : null,
    isActive: category.isActive,
    sortOrder: category.sortOrder,
    productCount: countMap.get(category._id.toString()) ?? 0,
  }));
}

export async function createAdminCategory(input: z.infer<typeof categoryWriteSchema>) {
  await connectDB();
  const slug = await uniqueValue(Category, "slug", slugify(input.slug || input.name));
  const category = await Category.create({
    name: input.name,
    slug,
    description: input.description,
    image: input.image,
    parent: input.parentId ? objectId(input.parentId) : null,
    isActive: input.isActive ?? true,
    sortOrder: input.sortOrder ?? 0,
  });
  return category;
}

export async function updateAdminCategory(id: string, input: Partial<z.infer<typeof categoryWriteSchema>>) {
  await connectDB();
  const category = await Category.findById(id);
  if (!category) throw new Error("Category not found.");
  if (input.name) category.name = input.name;
  if (input.description !== undefined) category.description = input.description;
  if (input.image !== undefined) category.image = input.image;
  if (input.isActive != null) category.isActive = input.isActive;
  if (input.sortOrder != null) category.sortOrder = input.sortOrder;
  if (input.parentId !== undefined) {
    category.parent = input.parentId && input.parentId !== id ? objectId(input.parentId) : null;
  }
  if (input.slug || input.name) {
    category.slug = await uniqueValue(Category, "slug", slugify(input.slug || input.name || category.name), id);
  }
  await category.save();
  return category;
}

function serializeOrder(order: LeanOrder, items: LeanOrderItem[] = [], payment?: LeanPayment | null) {
  return {
    id: order._id.toString(),
    orderNumber: order.orderNumber,
    customer: order.customer,
    shipping: order.shipping,
    subtotal: order.subtotal,
    deliveryFee: order.deliveryFee,
    discount: order.discount,
    total: order.total,
    couponCode: order.couponCode,
    status: order.status,
    paymentStatus: order.paymentStatus,
    notes: order.notes,
    internalNotes: order.internalNotes,
    timeline: order.timeline,
    estimatedDelivery: order.estimatedDelivery?.toISOString(),
    createdAt: order.createdAt.toISOString(),
    items: items.map((item) => ({
      id: item._id.toString(),
      name: item.name,
      slug: item.slug,
      sku: item.sku,
      image: item.image,
      variantLabel: item.variantLabel,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      subtotal: item.subtotal,
      productId: item.product.toString(),
      variantId: item.variant?.toString(),
    })),
    payment: payment
      ? {
          id: payment._id.toString(),
          provider: payment.provider,
          amount: payment.amount,
          status: payment.status,
          providerReference: payment.providerReference,
          paidAt: payment.paidAt?.toISOString(),
        }
      : null,
  };
}

export async function listAdminOrders(query: z.infer<typeof adminOrderListQuerySchema>) {
  await connectDB();
  const filter: Record<string, unknown> = {};
  if (query.status !== "all") filter.status = query.status;
  if (query.paymentStatus !== "all") filter.paymentStatus = query.paymentStatus;
  if (query.q) {
    const regex = new RegExp(escapeRegex(query.q), "i");
    filter.$or = [
      { orderNumber: regex },
      { "customer.name": regex },
      { "customer.email": regex },
      { "customer.phone": regex },
    ];
  }
  const skip = (query.page - 1) * query.limit;
  const [rows, total] = await Promise.all([
    Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(query.limit).lean<LeanOrder[]>(),
    Order.countDocuments(filter),
  ]);
  return {
    items: rows.map((row) => serializeOrder(row)),
    total,
    page: query.page,
    limit: query.limit,
    pages: Math.max(1, Math.ceil(total / query.limit)),
  };
}

export async function getAdminOrder(id: string) {
  await connectDB();
  const order = await Order.findById(id).lean<LeanOrder | null>();
  if (!order) return null;
  const [items, payment] = await Promise.all([
    OrderItem.find({ order: order._id }).lean<LeanOrderItem[]>(),
    order.payment ? Payment.findById(order.payment).lean<LeanPayment | null>() : null,
  ]);
  return serializeOrder(order, items, payment);
}

async function restockOrder(orderId: Types.ObjectId, orderNumber: string, actorId?: string) {
  const items = await OrderItem.find({ order: orderId }).lean<LeanOrderItem[]>();
  await Promise.all(
    items.map(async (item) => {
      if (item.variant) {
        await ProductVariant.updateOne({ _id: item.variant }, { $inc: { stock: item.quantity } });
      } else {
        await Product.updateOne({ _id: item.product }, { $inc: { stock: item.quantity, soldCount: -item.quantity } });
      }
      await InventoryTransaction.create({
        product: item.product,
        variant: item.variant,
        type: "RELEASE",
        quantity: item.quantity,
        order: orderId,
        note: `Cancelled ${orderNumber}`,
        createdBy: actorId ? objectId(actorId) : undefined,
      });
    }),
  );
}

export async function updateAdminOrder(id: string, input: z.infer<typeof orderUpdateSchema>, actorId?: string) {
  await connectDB();
  const order = await Order.findById(id);
  if (!order) throw new Error("Order not found.");

  if (input.status && input.status !== order.status) {
    if (input.status === "CANCELLED" && order.status !== "CANCELLED") {
      await restockOrder(order._id, order.orderNumber, actorId);
    }
    order.status = input.status as OrderStatus;
    order.timeline.push({
      status: input.status,
      at: new Date(),
      note: input.note || `Status set to ${input.status.replaceAll("_", " ").toLowerCase()}`,
    });
  }

  if (input.paymentStatus && input.paymentStatus !== order.paymentStatus) {
    order.paymentStatus = input.paymentStatus as PaymentStatus;
    if (order.payment) {
      await Payment.updateOne(
        { _id: order.payment },
        {
          status: input.paymentStatus,
          paidAt: input.paymentStatus === "PAID" ? new Date() : undefined,
        },
      );
    }
    if (input.paymentStatus === "PAID" && order.status === "PENDING") {
      order.status = "CONFIRMED";
      order.timeline.push({ status: "CONFIRMED", at: new Date(), note: input.note || "Payment confirmed" });
    }
  }

  if (input.internalNotes !== undefined) order.internalNotes = input.internalNotes;
  await order.save();
  return getAdminOrder(id);
}

export async function listAdminCustomers(query: z.infer<typeof adminCustomerListQuerySchema>) {
  await connectDB();
  const filter: Record<string, unknown> = {};
  if (query.role !== "all") filter.role = query.role;
  if (query.status === "active") filter.isActive = true;
  if (query.status === "inactive") filter.isActive = false;
  if (query.q) {
    const regex = new RegExp(escapeRegex(query.q), "i");
    filter.$or = [{ name: regex }, { email: regex }, { phone: regex }];
  }
  const skip = (query.page - 1) * query.limit;
  const [rows, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(query.limit).lean<LeanUser[]>(),
    User.countDocuments(filter),
  ]);

  const ids = rows.map((row) => row._id);
  const orderCounts = await Order.aggregate<{ _id: Types.ObjectId; count: number; spent: number }>([
    { $match: { user: { $in: ids } } },
    { $group: { _id: "$user", count: { $sum: 1 }, spent: { $sum: "$total" } } },
  ]);
  const stats = new Map(orderCounts.map((item) => [item._id.toString(), item]));

  return {
    items: rows.map((row) => ({
      id: row._id.toString(),
      name: row.name,
      email: row.email,
      phone: row.phone,
      role: row.role,
      isActive: row.isActive,
      createdAt: row.createdAt.toISOString(),
      orderCount: stats.get(row._id.toString())?.count ?? 0,
      totalSpent: stats.get(row._id.toString())?.spent ?? 0,
    })),
    total,
    page: query.page,
    limit: query.limit,
    pages: Math.max(1, Math.ceil(total / query.limit)),
  };
}

export async function getAdminCustomer(id: string) {
  await connectDB();
  const user = await User.findById(id).lean<LeanUser | null>();
  if (!user) return null;
  const orders = await Order.find({ user: user._id }).sort({ createdAt: -1 }).limit(20).lean<LeanOrder[]>();
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt.toISOString(),
    orders: orders.map((order) => serializeOrder(order)),
  };
}

export async function updateAdminCustomer(
  id: string,
  input: z.infer<typeof customerUpdateSchema>,
  actorRole: UserRole,
) {
  await connectDB();
  const user = await User.findById(id);
  if (!user) throw new Error("Customer not found.");
  if (input.role && actorRole !== "ADMIN") {
    throw new Error("Only an owner admin can change roles.");
  }
  if (input.role) user.role = input.role;
  if (input.isActive != null) user.isActive = input.isActive;
  if (input.name) user.name = input.name;
  if (input.phone !== undefined) user.phone = input.phone;
  await user.save();
  return getAdminCustomer(id);
}

export async function listAdminCoupons() {
  await connectDB();
  const coupons = await Coupon.find().sort({ createdAt: -1 }).lean<LeanCoupon[]>();
  return coupons.map((coupon) => ({
    id: coupon._id.toString(),
    code: coupon.code,
    type: coupon.type,
    value: coupon.value,
    minOrderAmount: coupon.minOrderAmount,
    startsAt: coupon.startsAt?.toISOString(),
    expiresAt: coupon.expiresAt?.toISOString(),
    usageLimit: coupon.usageLimit,
    usedCount: coupon.usedCount,
    isActive: coupon.isActive,
  }));
}

export async function createAdminCoupon(input: z.infer<typeof couponWriteSchema>) {
  await connectDB();
  const coupon = await Coupon.create({
    ...input,
    code: input.code.trim().toUpperCase(),
    minOrderAmount: input.minOrderAmount ?? 0,
    isActive: input.isActive ?? true,
  });
  return coupon;
}

export async function updateAdminCoupon(id: string, input: Partial<z.infer<typeof couponWriteSchema>>) {
  await connectDB();
  const coupon = await Coupon.findById(id);
  if (!coupon) throw new Error("Coupon not found.");
  if (input.code) coupon.code = input.code.trim().toUpperCase();
  if (input.type) coupon.type = input.type;
  if (input.value != null) coupon.value = input.value;
  if (input.minOrderAmount != null) coupon.minOrderAmount = input.minOrderAmount;
  if (input.startsAt !== undefined) coupon.startsAt = input.startsAt;
  if (input.expiresAt !== undefined) coupon.expiresAt = input.expiresAt;
  if (input.usageLimit !== undefined) coupon.usageLimit = input.usageLimit;
  if (input.isActive != null) coupon.isActive = input.isActive;
  await coupon.save();
  return coupon;
}

async function refreshProductRating(productId: Types.ObjectId) {
  const approved = await Review.find({ product: productId, isApproved: true }).lean<IReview[]>();
  const reviewCount = approved.length;
  const ratingAverage = reviewCount
    ? Math.round((approved.reduce((sum, review) => sum + review.rating, 0) / reviewCount) * 10) / 10
    : 0;
  await Product.updateOne({ _id: productId }, { ratingAverage, reviewCount });
}

export async function listAdminReviews(query: z.infer<typeof adminReviewListQuerySchema>) {
  await connectDB();
  const filter: Record<string, unknown> = {};
  if (query.status === "pending") filter.isApproved = false;
  if (query.status === "approved") filter.isApproved = true;
  if (query.q) {
    const regex = new RegExp(escapeRegex(query.q), "i");
    filter.comment = regex;
  }
  const skip = (query.page - 1) * query.limit;
  const [rows, total] = await Promise.all([
    Review.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(query.limit)
      .populate("user", "name email")
      .populate("product", "name slug")
      .lean<LeanReview[]>(),
    Review.countDocuments(filter),
  ]);
  return {
    items: rows.map((review) => ({
      id: review._id.toString(),
      rating: review.rating,
      comment: review.comment,
      isApproved: review.isApproved,
      isVerifiedPurchase: review.isVerifiedPurchase,
      createdAt: review.createdAt.toISOString(),
      user:
        review.user && typeof review.user === "object" && "email" in review.user
          ? { id: review.user._id.toString(), name: review.user.name, email: review.user.email }
          : null,
      product:
        review.product && typeof review.product === "object" && "slug" in review.product
          ? { id: review.product._id.toString(), name: review.product.name, slug: review.product.slug }
          : null,
    })),
    total,
    page: query.page,
    limit: query.limit,
    pages: Math.max(1, Math.ceil(total / query.limit)),
  };
}

export async function updateAdminReview(id: string, isApproved: boolean) {
  await connectDB();
  const review = await Review.findById(id);
  if (!review) throw new Error("Review not found.");
  review.isApproved = isApproved;
  await review.save();
  await refreshProductRating(review.product);
  return review;
}

export async function deleteAdminReview(id: string) {
  await connectDB();
  const review = await Review.findByIdAndDelete(id);
  if (!review) throw new Error("Review not found.");
  await refreshProductRating(review.product);
}

export async function listInventory(limit = 20) {
  await connectDB();
  const rows = await InventoryTransaction.find()
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate("product", "name sku")
    .lean<LeanInventory[]>();
  return rows.map((row) => ({
    id: row._id.toString(),
    type: row.type,
    quantity: row.quantity,
    balanceAfter: row.balanceAfter,
    note: row.note,
    createdAt: row.createdAt.toISOString(),
    product:
      row.product && typeof row.product === "object" && "name" in row.product
        ? { id: row.product._id.toString(), name: row.product.name, sku: row.product.sku }
        : null,
  }));
}

export async function listLowStockProducts() {
  await connectDB();
  const products = await Product.find({
    isActive: true,
    $expr: { $lte: ["$stock", "$lowStockThreshold"] },
  })
    .sort({ stock: 1 })
    .limit(20)
    .populate("category", "name slug")
    .lean<LeanProduct[]>();
  return products.map((product) => ({
    ...serializeProduct(product),
    stockStatus: getStockStatus(product.stock, product.lowStockThreshold),
  }));
}

export async function adjustInventory(input: z.infer<typeof inventoryAdjustSchema>, actorId?: string) {
  await connectDB();
  const product = await Product.findById(input.productId);
  if (!product) throw new Error("Product not found.");

  if (input.variantId) {
    const variant = await ProductVariant.findOne({ _id: input.variantId, product: product._id });
    if (!variant) throw new Error("Variant not found.");
    const next = variant.stock + input.quantity;
    if (next < 0) throw new Error("Not enough stock to remove.");
    variant.stock = next;
    await variant.save();
    await InventoryTransaction.create({
      product: product._id,
      variant: variant._id,
      type: input.quantity >= 0 ? "RESTOCK" : "ADJUSTMENT",
      quantity: input.quantity,
      balanceAfter: next,
      note: input.note,
      createdBy: actorId ? objectId(actorId) : undefined,
    });
    return { stock: next };
  }

  const next = product.stock + input.quantity;
  if (next < 0) throw new Error("Not enough stock to remove.");
  product.stock = next;
  await product.save();
  await InventoryTransaction.create({
    product: product._id,
    type: input.quantity >= 0 ? "RESTOCK" : "ADJUSTMENT",
    quantity: input.quantity,
    balanceAfter: next,
    note: input.note,
    createdBy: actorId ? objectId(actorId) : undefined,
  });
  return { stock: next };
}

export async function getAdminDashboard() {
  await connectDB();
  const [sales, orders, customers, products, lowStock, pending, unpaid, pendingReviews, recentOrders] =
    await Promise.all([
      Order.aggregate([{ $match: { paymentStatus: "PAID" } }, { $group: { _id: null, total: { $sum: "$total" } } }]),
      Order.countDocuments(),
      User.countDocuments({ role: "CUSTOMER" }),
      Product.countDocuments(),
      Product.countDocuments({ isActive: true, $expr: { $lte: ["$stock", "$lowStockThreshold"] } }),
      Order.countDocuments({ status: "PENDING" }),
      Order.countDocuments({ paymentStatus: "PENDING" }),
      Review.countDocuments({ isApproved: false }),
      Order.find().sort({ createdAt: -1 }).limit(6).lean<LeanOrder[]>(),
    ]);

  return {
    stats: {
      sales: sales[0]?.total ?? 0,
      orders,
      customers,
      products,
      lowStock,
      pending,
      unpaid,
      pendingReviews,
    },
    recentOrders: recentOrders.map((order) => serializeOrder(order)),
    lowStockProducts: await listLowStockProducts(),
  };
}
