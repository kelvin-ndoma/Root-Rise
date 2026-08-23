import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db/connect";
import { Order } from "@/models/Order";
import { OrderItem } from "@/models/OrderItem";
import { formatMoney } from "@/lib/utils/currency";
import { cn } from "@/lib/utils/cn";

export default async function OrderDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  const { id } = await params;
  await connectDB();
  const order = await Order.findOne({ _id: id, user: session?.user?.id });
  if (!order) notFound();
  const items = await OrderItem.find({ order: order._id });
  const timeline = ["PENDING", "CONFIRMED", "PROCESSING", "READY_FOR_DELIVERY", "OUT_FOR_DELIVERY", "DELIVERED"] as const;
  const currentIndex = timeline.indexOf(order.status as (typeof timeline)[number]);

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="break-words font-display text-3xl text-brand sm:text-4xl">{order.orderNumber}</h1>
      <p className="mt-2 text-sm text-ink/50">
        {order.status.replaceAll("_", " ")} · Payment {order.paymentStatus.toLowerCase()}
      </p>
      <ol className="mt-8 space-y-3">
        {timeline.map((status, index) => (
          <li key={status} className={cn("rounded-2xl px-4 py-3 text-sm", index <= currentIndex ? "bg-brand text-cream" : "bg-white")}>
            {status.replaceAll("_", " ")}
          </li>
        ))}
        {order.status === "CANCELLED" ? <li className="rounded-2xl bg-rose/15 px-4 py-3 text-sm">Cancelled</li> : null}
      </ol>
      <div className="mt-8 rounded-3xl bg-white p-5">
        {items.map((item) => (
          <p key={item._id.toString()} className="flex justify-between py-2 text-sm">
            <span>
              {item.name} × {item.quantity}
            </span>
            <span>{formatMoney(item.subtotal)}</span>
          </p>
        ))}
        <p className="mt-3 font-medium">Total {formatMoney(order.total)}</p>
      </div>
    </div>
  );
}
