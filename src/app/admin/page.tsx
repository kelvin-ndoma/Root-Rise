import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { getAdminDashboard } from "@/lib/services/admin.service";
import { formatMoney } from "@/lib/utils/currency";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const { stats, recentOrders, lowStockProducts } = await getAdminDashboard();

  const cards = [
    { label: "Paid sales", value: formatMoney(stats.sales), href: "/admin/orders?paymentStatus=PAID" },
    { label: "Orders", value: String(stats.orders), href: "/admin/orders" },
    { label: "Pending orders", value: String(stats.pending), href: "/admin/orders?status=PENDING" },
    { label: "Unpaid", value: String(stats.unpaid), href: "/admin/orders?paymentStatus=PENDING" },
    { label: "Customers", value: String(stats.customers), href: "/admin/customers" },
    { label: "Products", value: String(stats.products), href: "/admin/products" },
    { label: "Low stock", value: String(stats.lowStock), href: "/admin/inventory" },
    { label: "Reviews to approve", value: String(stats.pendingReviews), href: "/admin/reviews?status=pending" },
  ];

  return (
    <div>
      <AdminPageHeader
        eyebrow="Overview"
        title="Dashboard"
        description="Fulfil orders, confirm payments, and keep the catalogue stocked."
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <Link key={card.label} href={card.href} className="min-w-0 rounded-3xl bg-white p-4 transition hover:-translate-y-0.5 sm:p-5">
            <p className="text-[11px] uppercase tracking-[0.16em] text-ink/40">{card.label}</p>
            <p className="mt-3 break-words font-display text-2xl text-brand sm:text-3xl">{card.value}</p>
          </Link>
        ))}
      </div>
      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <section className="rounded-3xl bg-white p-4 sm:p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="font-display text-2xl text-brand">Recent orders</h2>
            <Link href="/admin/orders" className="text-sm text-ink/50 hover:text-brand">
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {recentOrders.length ? (
              recentOrders.map((order) => (
                <Link
                  key={order.id}
                  href={`/admin/orders/${order.id}`}
                  className="flex flex-col gap-2 rounded-2xl bg-cream/80 px-4 py-3 text-sm hover:bg-cream sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="font-medium">{order.orderNumber}</p>
                    <p className="truncate text-ink/50">{order.customer.name}</p>
                  </div>
                  <div className="shrink-0 sm:text-right">
                    <p>{formatMoney(order.total)}</p>
                    <StatusBadge value={order.status} />
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-sm text-ink/50">No orders yet.</p>
            )}
          </div>
        </section>
        <section className="rounded-3xl bg-white p-4 sm:p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="font-display text-2xl text-brand">Low stock</h2>
            <Link href="/admin/inventory" className="text-sm text-ink/50 hover:text-brand">
              Manage
            </Link>
          </div>
          <div className="space-y-3">
            {lowStockProducts.length ? (
              lowStockProducts.map((product) => (
                <Link
                  key={product.id}
                  href={`/admin/products/${product.id}`}
                  className="flex items-center justify-between gap-3 rounded-2xl bg-cream/80 px-4 py-3 text-sm hover:bg-cream"
                >
                  <span className="min-w-0 truncate">{product.name}</span>
                  <StatusBadge value={product.stockStatus} />
                </Link>
              ))
            ) : (
              <p className="text-sm text-ink/50">All published products are above their low-stock threshold.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
