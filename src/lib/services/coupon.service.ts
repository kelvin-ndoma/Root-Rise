import { connectDB } from "@/lib/db/connect";
import { Coupon } from "@/models/Coupon";

export type CouponPreview = {
  code: string;
  discount: number;
  message: string;
};

export async function previewCoupon(code: string, subtotal: number): Promise<CouponPreview> {
  await connectDB();
  const coupon = await Coupon.findOne({
    code: code.trim().toUpperCase(),
    isActive: true,
  });

  if (!coupon) {
    throw new Error("This coupon code is not valid.");
  }

  const now = new Date();
  if (coupon.startsAt && coupon.startsAt > now) {
    throw new Error("This coupon is not active yet.");
  }
  if (coupon.expiresAt && coupon.expiresAt < now) {
    throw new Error("This coupon has expired.");
  }
  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
    throw new Error("This coupon has reached its usage limit.");
  }
  if (subtotal < coupon.minOrderAmount) {
    throw new Error(`Add ${coupon.minOrderAmount - subtotal} more to use this coupon.`);
  }

  const discount =
    coupon.type === "PERCENTAGE"
      ? Math.round((subtotal * coupon.value) / 100)
      : Math.min(coupon.value, subtotal);

  return {
    code: coupon.code,
    discount,
    message: coupon.type === "PERCENTAGE" ? `${coupon.value}% off` : "Fixed discount applied",
  };
}
