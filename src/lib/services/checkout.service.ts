import { nanoid } from "nanoid";
import { Types } from "mongoose";
import { connectDB } from "@/lib/db/connect";
import { Order } from "@/models/Order";
import { OrderItem } from "@/models/OrderItem";
import { Payment } from "@/models/Payment";
import { Product } from "@/models/Product";
import { ProductVariant } from "@/models/ProductVariant";
import { InventoryTransaction } from "@/models/InventoryTransaction";
import { Coupon } from "@/models/Coupon";
import { previewCoupon } from "@/lib/services/coupon.service";
import { getPaymentProvider } from "@/lib/payments/registry";
import { siteConfig } from "@/config/site";
import type { CartLine } from "@/types";
import type { z } from "zod";
import type { checkoutSchema } from "@/lib/validations/checkout";

type CheckoutInput = z.infer<typeof checkoutSchema> & {
  userId?: string;
  items: CartLine[];
};

type Reserved = { productId: string; variantId?: string; quantity: number };

function deliveryFeeFor(county: string) {
  return county === "Nairobi" || county === "Kiambu" ? 250 : 450;
}

function orderNumber() {
  return `RR-${new Date().getFullYear()}-${nanoid(8).toUpperCase()}`;
}

async function releaseReservations(reserved: Reserved[]) {
  await Promise.all(
    reserved.map((item) =>
      item.variantId
        ? ProductVariant.updateOne({ _id: item.variantId }, { $inc: { stock: item.quantity } })
        : Product.updateOne({ _id: item.productId }, { $inc: { stock: item.quantity, soldCount: -item.quantity } }),
    ),
  );
}

export async function placeOrder(input: CheckoutInput) {
  if (!input.items.length) {
    throw new Error("Your cart is empty.");
  }

  await connectDB();

  const reserved: Reserved[] = [];
  const snapshots: Array<CartLine & { sku: string }> = [];

  try {
    let subtotal = 0;

    for (const line of input.items) {
      if (line.variantId) {
        const variant = await ProductVariant.findOneAndUpdate(
          {
            _id: line.variantId,
            product: line.productId,
            isActive: true,
            stock: { $gte: line.quantity },
          },
          { $inc: { stock: -line.quantity } },
          { new: true },
        );
        if (!variant) {
          throw new Error(`${line.name} does not have enough stock.`);
        }
        reserved.push({ productId: line.productId, variantId: line.variantId, quantity: line.quantity });
        await Product.updateOne({ _id: line.productId }, { $inc: { soldCount: line.quantity } });
        snapshots.push({ ...line, unitPrice: variant.price, sku: variant.sku });
        subtotal += variant.price * line.quantity;
      } else {
        const product = await Product.findOneAndUpdate(
          {
            _id: line.productId,
            isActive: true,
            hasVariants: false,
            stock: { $gte: line.quantity },
          },
          { $inc: { stock: -line.quantity, soldCount: line.quantity } },
          { new: true },
        );
        if (!product) {
          throw new Error(`${line.name} does not have enough stock.`);
        }
        reserved.push({ productId: line.productId, quantity: line.quantity });
        snapshots.push({ ...line, unitPrice: product.price, sku: product.sku });
        subtotal += product.price * line.quantity;
      }
    }

    let discount = 0;
    let couponCode: string | undefined;
    if (input.couponCode) {
      const preview = await previewCoupon(input.couponCode, subtotal);
      discount = preview.discount;
      couponCode = preview.code;
      await Coupon.updateOne({ code: preview.code }, { $inc: { usedCount: 1 } });
    }

    const deliveryFee = deliveryFeeFor(input.county);
    const total = Math.max(0, subtotal + deliveryFee - discount);
    const number = orderNumber();

    const order = await Order.create({
      orderNumber: number,
      user: input.userId ? new Types.ObjectId(input.userId) : undefined,
      customer: { name: input.name, email: input.email, phone: input.phone },
      shipping: {
        county: input.county,
        town: input.town,
        address: input.address,
        instructions: input.instructions || undefined,
      },
      subtotal,
      deliveryFee,
      discount,
      total,
      couponCode,
      status: "PENDING",
      paymentStatus: "PENDING",
      timeline: [{ status: "PENDING", at: new Date(), note: "Order placed" }],
      estimatedDelivery: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3),
    });

    await OrderItem.insertMany(
      snapshots.map((item) => ({
        order: order._id,
        product: item.productId,
        variant: item.variantId,
        name: item.name,
        slug: item.slug,
        sku: item.sku,
        image: item.image,
        variantLabel: item.variantLabel,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        subtotal: item.unitPrice * item.quantity,
      })),
    );

    await InventoryTransaction.insertMany(
      snapshots.map((item) => ({
        product: item.productId,
        variant: item.variantId,
        type: "SALE",
        quantity: -item.quantity,
        order: order._id,
        note: `Order ${number}`,
      })),
    );

    const provider = getPaymentProvider(input.paymentMethod);
    const initiation = await provider.initiate({
      orderId: order._id.toString(),
      orderNumber: number,
      amount: total,
      currency: siteConfig.currency,
      customer: { name: input.name, email: input.email, phone: input.phone },
      returnUrl: `${siteConfig.url}/order-success/${order._id.toString()}`,
    });

    const payment = await Payment.create({
      order: order._id,
      provider: provider.id,
      amount: total,
      currency: siteConfig.currency,
      status: initiation.status,
      providerReference: initiation.providerReference,
      metadata: initiation.metadata,
      paidAt: initiation.status === "PAID" ? new Date() : undefined,
    });

    order.payment = payment._id;
    order.paymentStatus = initiation.status;
    if (initiation.status === "PAID") {
      order.status = "CONFIRMED";
      order.timeline.push({ status: "CONFIRMED", at: new Date(), note: "Payment confirmed" });
    }
    await order.save();

    return {
      orderId: order._id.toString(),
      orderNumber: number,
      paymentStatus: order.paymentStatus,
      redirectUrl: initiation.redirectUrl,
      instructions: initiation.instructions,
    };
  } catch (error) {
    await releaseReservations(reserved);
    throw error;
  }
}
