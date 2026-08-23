import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db/connect";
import { Order } from "@/models/Order";
import Link from "next/link";
import { formatMoney } from "@/lib/utils/currency";

export default async function AccountPage() {
  const session = await auth();
  await connectDB();
  const orders = session?.user?.id
    ? await Order.find({ user: session.user.id }).sort({ createdAt: -1 }).limit(5)
    : [];

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="font-display text-3xl text-brand sm:text-4xl md:text-5xl">Hello, {session?.user?.name}</h1>
      <p className="mt-2 text-sm text-ink/55">Your orders, saved items, and account details live here.</p>
      <h2 className="mt-10 font-display text-2xl text-brand sm:text-3xl">Recent orders</h2>
      <div className="mt-4 divide-y divide-brand/10 overflow-hidden rounded-3xl bg-white">
        {orders.length ? (
          orders.map((order) => (
            <Link
              key={order._id.toString()}
              href={`/account/orders/${order._id}`}
              className="flex flex-col gap-1 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5"
            >
              <span className="font-medium">{order.orderNumber}</span>
              <span className="text-sm text-ink/60">
                {order.status.replaceAll("_", " ")} · {formatMoney(order.total)}
              </span>
            </Link>
          ))
        ) : (
          <p className="px-5 py-8 text-sm text-ink/50">No orders yet.</p>
        )}
      </div>
    </div>
  );
}
