export const USER_ROLES = ["CUSTOMER", "ADMIN", "STAFF"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const STOCK_STATUSES = ["IN_STOCK", "LOW_STOCK", "OUT_OF_STOCK"] as const;
export type StockStatus = (typeof STOCK_STATUSES)[number];

export const ORDER_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "READY_FOR_DELIVERY",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const PAYMENT_STATUSES = ["PENDING", "PAID", "FAILED", "REFUNDED"] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const COUPON_TYPES = ["PERCENTAGE", "FIXED"] as const;
export type CouponType = (typeof COUPON_TYPES)[number];

export const INVENTORY_TRANSACTION_TYPES = [
  "RESERVE",
  "RELEASE",
  "SALE",
  "ADJUSTMENT",
  "RESTOCK",
] as const;
export type InventoryTransactionType = (typeof INVENTORY_TRANSACTION_TYPES)[number];

export const PRODUCT_SORT_OPTIONS = [
  "featured",
  "newest",
  "price-asc",
  "price-desc",
  "best-selling",
  "rating",
] as const;
export type ProductSort = (typeof PRODUCT_SORT_OPTIONS)[number];

export const AVAILABILITY_FILTERS = ["all", "in-stock", "out-of-stock"] as const;
export type AvailabilityFilter = (typeof AVAILABILITY_FILTERS)[number];

export type MediaAsset = {
  url: string;
  publicId?: string;
  alt?: string;
};

export type VariantOption = {
  name: string;
  value: string;
};

export type ProductSpecification = {
  name: string;
  value: string;
};

export type SerializedCategory = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: MediaAsset;
  parentId?: string | null;
  isActive: boolean;
  sortOrder?: number;
  productCount?: number;
};

export type SerializedVariant = {
  id: string;
  sku: string;
  label: string;
  options: VariantOption[];
  price: number;
  compareAtPrice?: number | null;
  stock: number;
  stockStatus: StockStatus;
  image?: MediaAsset;
  isActive: boolean;
};

export type SerializedProduct = {
  id: string;
  name: string;
  slug: string;
  sku: string;
  description: string;
  images: MediaAsset[];
  category: Pick<SerializedCategory, "id" | "name" | "slug"> | null;
  price: number;
  compareAtPrice?: number | null;
  stock: number;
  lowStockThreshold: number;
  stockStatus: StockStatus;
  hasVariants: boolean;
  isActive?: boolean;
  isFeatured: boolean;
  isBestSeller: boolean;
  specifications: ProductSpecification[];
  ratingAverage: number;
  reviewCount: number;
  soldCount: number;
  variants?: SerializedVariant[];
  seoTitle?: string;
  seoDescription?: string;
};

export type ProductListResult = {
  items: SerializedProduct[];
  total: number;
  page: number;
  limit: number;
  pages: number;
};

export type CartLine = {
  productId: string;
  variantId?: string;
  slug: string;
  name: string;
  image?: string;
  variantLabel?: string;
  unitPrice: number;
  quantity: number;
  maxQuantity: number;
};
