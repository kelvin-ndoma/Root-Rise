import { Types } from "mongoose";
import { connectDB } from "@/lib/db/connect";
import { Cart } from "@/models/Cart";
import { CartItem } from "@/models/CartItem";
import { Product } from "@/models/Product";
import { ProductVariant } from "@/models/ProductVariant";
import type { CartLine } from "@/types";
import { getStockStatus } from "@/lib/utils/inventory";

async function getOrCreateCart(userId: string) {
  await connectDB();
  const user = new Types.ObjectId(userId);
  return Cart.findOneAndUpdate({ user }, { user }, { upsert: true, new: true, setDefaultsOnInsert: true });
}

async function toCartLine(item: {
  product: Types.ObjectId;
  variant?: Types.ObjectId;
  quantity: number;
}): Promise<CartLine | null> {
  const product = await Product.findById(item.product);
  if (!product || !product.isActive) return null;

  if (item.variant) {
    const variant = await ProductVariant.findById(item.variant);
    if (!variant || !variant.isActive) return null;
    const status = getStockStatus(variant.stock, variant.lowStockThreshold);
    if (status === "OUT_OF_STOCK") return null;
    return {
      productId: product._id.toString(),
      variantId: variant._id.toString(),
      slug: product.slug,
      name: product.name,
      image: variant.image?.url ?? product.images[0]?.url,
      variantLabel: variant.label,
      unitPrice: variant.price,
      quantity: Math.min(item.quantity, variant.stock),
      maxQuantity: variant.stock,
    };
  }

  const status = getStockStatus(product.stock, product.lowStockThreshold);
  if (status === "OUT_OF_STOCK") return null;
  return {
    productId: product._id.toString(),
    slug: product.slug,
    name: product.name,
    image: product.images[0]?.url,
    unitPrice: product.price,
    quantity: Math.min(item.quantity, product.stock),
    maxQuantity: product.stock,
  };
}

export async function getUserCart(userId: string): Promise<CartLine[]> {
  const cart = await getOrCreateCart(userId);
  const items = await CartItem.find({ cart: cart._id });
  const lines = await Promise.all(items.map((item) => toCartLine(item)));
  return lines.filter((line): line is CartLine => Boolean(line));
}

export async function setCartLine(
  userId: string,
  input: { productId: string; variantId?: string; quantity: number },
) {
  const cart = await getOrCreateCart(userId);
  const productId = new Types.ObjectId(input.productId);
  const variantId = input.variantId ? new Types.ObjectId(input.variantId) : undefined;
  const query = {
    cart: cart._id,
    product: productId,
    variant: variantId ?? null,
  };

  if (input.quantity <= 0) {
    await CartItem.deleteOne(query);
    return getUserCart(userId);
  }

  const line = await toCartLine({
    product: productId,
    variant: variantId,
    quantity: input.quantity,
  });
  if (!line) {
    throw new Error("This product is currently unavailable.");
  }

  await CartItem.findOneAndUpdate(
    query,
    {
      cart: cart._id,
      product: productId,
      variant: variantId,
      quantity: Math.min(input.quantity, line.maxQuantity),
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  return getUserCart(userId);
}

export async function mergeGuestCart(userId: string, guestLines: CartLine[]) {
  for (const line of guestLines) {
    const existing = (await getUserCart(userId)).find(
      (item) => item.productId === line.productId && item.variantId === line.variantId,
    );
    const quantity = (existing?.quantity ?? 0) + line.quantity;
    await setCartLine(userId, {
      productId: line.productId,
      variantId: line.variantId,
      quantity,
    });
  }
  return getUserCart(userId);
}

export async function clearUserCart(userId: string) {
  const cart = await getOrCreateCart(userId);
  await CartItem.deleteMany({ cart: cart._id });
}
