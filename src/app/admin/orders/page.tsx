import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { Pagination } from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import { AdminTable, adminFieldClass } from "@/components/admin/admin-ui";
import { listAdminOrders } from "@/lib/services/admin.service";
import { adminOrderListQuerySchema } from "@/lib/validations/admin";
import { formatMoney } from "@/lib/utils/currency";
import { ORDER_STATUSES, PAYMENT_STATUSES } from "@/types";

export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;
function first(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AdminOrdersPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const query = adminOrderListQuerySchema.parse({
    q: first(params.q),
    status: first(params.status),
    paymentStatus: first(params.paymentStatus),
    page: first(params.page),
  });
  const result = await listAdminOrders(query);

  const hrefFor = (page: number) => {
    const next = new URLSearchParams();
    if (query.q) next.set("q", query.q);
    if (query.status !== "all") next.set("status", query.status);
    if (query.paymentStatus !== "all") next.set("paymentStatus", query.paymentStatus);
    next.set("page", String(page));
    return `/admin/orders?${next.toString()}`;
  };

  return (
    <div>
      <AdminPageHeader
        eyebrow="Fulfilment"
        title="Orders"
        description="Confirm payments, move orders through delivery, and cancel with restock."
      />
      <form className="mb-6 grid gap-3 rounded-3xl bg-white p-4 sm:grid-cols-2 xl:grid-cols-4">
        <input name="q" defaultValue={query.q} placeholder="Order number, name, email" className={adminFieldClass} />
        <select name="status" defaultValue={query.status} className={adminFieldClass}>
          <option value="all">All statuses</option>
          {ORDER_STATUSES.map((status) => (
            <option key={status} value={status}>
              {status.replaceAll("_", " ")}
            </option>
          ))}
        </select>
        <select name="paymentStatus" defaultValue={query.paymentStatus} className={adminFieldClass}>
          <option value="all">All payments</option>
          {PAYMENT_STATUSES.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
        <Button type="submit" variant="outline">
          Filter
        </Button>
      </form>
      <AdminTable>
          <thead className="bg-cream/80 text-[11px] uppercase tracking-[0.16em] text-ink/45">
            <tr>
              <th className="px-4 py-3 font-medium">Order</th>
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium">Total</th>
              <th className="px-4 py-3 font-medium">Payment</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {result.items.map((order) => (
              <tr key={order.id} className="border-t border-brand/8">
                <td className="px-4 py-3">
                  <Link href={`/admin/orders/${order.id}`} className="font-medium hover:text-brand">
                    {order.orderNumber}
                  </Link>
                  <p className="text-xs text-ink/40">{new Date(order.createdAt).toLocaleDateString()}</p>
                </td>
                <td className="px-4 py-3">
                  {order.customer.name}
                  <p className="text-xs text-ink/40">{order.customer.email}</p>
                </td>
                <td className="px-4 py-3">{formatMoney(order.total)}</td>
                <td className="px-4 py-3">
                  <StatusBadge value={order.paymentStatus} />
                </td>
                <td className="px-4 py-3">
                  <StatusBadge value={order.status} />
                </td>
              </tr>
            ))}
          </tbody>
      </AdminTable>
      {!result.items.length ? <p className="px-4 py-10 text-center text-sm text-ink/50">No orders match these filters.</p> : null}
      <div className="mt-6">
        <Pagination page={result.page} pages={result.pages} hrefFor={hrefFor} />
      </div>
    </div>
  );
}
