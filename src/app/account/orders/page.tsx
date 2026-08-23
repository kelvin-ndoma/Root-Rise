import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db/connect";
import { Order } from "@/models/Order";
import Link from "next/link";
import { formatMoney } from "@/lib/utils/currency";
import { EmptyState } from "@/components/ui/empty-state";

export default async function OrdersPage() {
  const session = await auth();
  await connectDB();
  const orders = session?.user?.id
    ? await Order.find({ user: session.user.id }).sort({ createdAt: -1 })
    : [];

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="font-display text-3xl text-brand sm:text-4xl md:text-5xl">Orders</h1>
      <div className="mt-8">
        {orders.length ? (
          <div className="divide-y divide-brand/10 rounded-3xl bg-white">
            {orders.map((order) => (
              <Link
                key={order._id.toString()}
                href={`/account/orders/${order._id}`}
                className="flex flex-col gap-1 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5"
              >
                <div>
                  <p className="font-medium">{order.orderNumber}</p>
                  <p className="text-sm text-ink/50">{order.createdAt.toLocaleDateString("en-KE")}</p>
                </div>
                <p className="text-sm">
                  {order.status.replaceAll("_", " ")} · {formatMoney(order.total)}
                </p>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState title="No orders yet" action={{ href: "/shop", label: "Start shopping" }} />
        )}
      </div>
    </div>
  );
}
