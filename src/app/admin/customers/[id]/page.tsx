import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { ToggleButton } from "@/components/admin/toggle-button";
import { getAdminCustomer } from "@/lib/services/admin.service";
import { formatMoney } from "@/lib/utils/currency";
import { auth } from "@/lib/auth";
import { AdminTable } from "@/components/admin/admin-ui";

export const dynamic = "force-dynamic";

export default async function AdminCustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const { id } = await params;
  const customer = await getAdminCustomer(id);
  if (!customer) notFound();

  return (
    <div>
      <AdminPageHeader
        eyebrow="People"
        title={customer.name}
        description={`${customer.email}${customer.phone ? ` · ${customer.phone}` : ""}`}
      />
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <StatusBadge value={customer.role} />
        <StatusBadge value={customer.isActive ? "ACTIVE" : "INACTIVE"} />
        <ToggleButton
          href={`/api/admin/customers/${customer.id}`}
          payload={{ isActive: !customer.isActive }}
          label={customer.isActive ? "Disable account" : "Enable account"}
        />
        {session?.user?.role === "ADMIN" && customer.role !== "ADMIN" ? (
          <ToggleButton
            href={`/api/admin/customers/${customer.id}`}
            payload={{ role: customer.role === "STAFF" ? "CUSTOMER" : "STAFF" }}
            label={customer.role === "STAFF" ? "Make customer" : "Make staff"}
          />
        ) : null}
      </div>
      <section className="rounded-3xl bg-white">
        <h2 className="px-5 py-4 font-display text-2xl text-brand">Orders</h2>
        <AdminTable className="rounded-none">
          <thead className="bg-cream/80 text-[11px] uppercase tracking-[0.16em] text-ink/45">
            <tr>
              <th className="px-4 py-3 font-medium">Order</th>
              <th className="px-4 py-3 font-medium">Total</th>
              <th className="px-4 py-3 font-medium">Payment</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {customer.orders.map((order) => (
              <tr key={order.id} className="border-t border-brand/8">
                <td className="px-4 py-3">
                  <Link href={`/admin/orders/${order.id}`} className="hover:text-brand">
                    {order.orderNumber}
                  </Link>
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
        {!customer.orders.length ? <p className="px-4 py-8 text-sm text-ink/50">No orders for this account.</p> : null}
      </section>
    </div>
  );
}
