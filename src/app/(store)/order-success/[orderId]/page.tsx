import { notFound } from "next/navigation";
import Link from "next/link";
import { connectDB } from "@/lib/db/connect";
import { Order } from "@/models/Order";
import { OrderItem } from "@/models/OrderItem";
import { formatMoney } from "@/lib/utils/currency";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Order confirmed" };

export default async function OrderSuccessPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  await connectDB();
  const order = await Order.findById(orderId);
  if (!order) notFound();
  const items = await OrderItem.find({ order: order._id });

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <p className="text-xs uppercase tracking-[0.2em] text-accent">Thank you</p>
      <h1 className="mt-3 font-display text-5xl text-brand">Order placed</h1>
      <p className="mt-4 text-ink/65">
        We have received order <strong>{order.orderNumber}</strong>. Payment status remains {order.paymentStatus.toLowerCase()} until confirmation is received from the payment provider.
      </p>
      <div className="mt-8 rounded-3xl bg-white p-6">
        <p className="text-sm">Status: {order.status.replaceAll("_", " ")}</p>
        <p className="mt-1 text-sm">Payment: {order.paymentStatus}</p>
        <ul className="mt-4 space-y-2 text-sm">
          {items.map((item) => (
            <li key={item._id.toString()} className="flex justify-between">
              <span>
                {item.name} {item.variantLabel ? `· ${item.variantLabel}` : ""} × {item.quantity}
              </span>
              <span>{formatMoney(item.subtotal)}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 font-medium">Total {formatMoney(order.total)}</p>
        <p className="mt-3 text-sm text-ink/60">
          Deliver to {order.shipping.address}, {order.shipping.town}, {order.shipping.county}.
        </p>
        {order.estimatedDelivery ? (
          <p className="mt-2 text-sm text-ink/60">
            Estimated delivery {order.estimatedDelivery.toLocaleDateString("en-KE", { dateStyle: "medium" })}.
          </p>
        ) : null}
      </div>
      <Link href="/account/orders" className="mt-8 inline-flex h-12 items-center rounded-full bg-brand px-6 text-sm text-cream">
        View my orders
      </Link>
    </div>
  );
}
