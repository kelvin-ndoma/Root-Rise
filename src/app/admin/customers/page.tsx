import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { ToggleButton } from "@/components/admin/toggle-button";
import { Pagination } from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import { AdminTable, adminFieldClass } from "@/components/admin/admin-ui";
import { listAdminCustomers } from "@/lib/services/admin.service";
import { adminCustomerListQuerySchema } from "@/lib/validations/admin";
import { formatMoney } from "@/lib/utils/currency";
import { USER_ROLES } from "@/types";

export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;
function first(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AdminCustomersPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const query = adminCustomerListQuerySchema.parse({
    q: first(params.q),
    role: first(params.role),
    status: first(params.status),
    page: first(params.page),
  });
  const result = await listAdminCustomers(query);

  const hrefFor = (page: number) => {
    const next = new URLSearchParams();
    if (query.q) next.set("q", query.q);
    if (query.role !== "all") next.set("role", query.role);
    if (query.status !== "all") next.set("status", query.status);
    next.set("page", String(page));
    return `/admin/customers?${next.toString()}`;
  };

  return (
    <div>
      <AdminPageHeader
        eyebrow="People"
        title="Customers"
        description="Search accounts, disable access, and open order history."
      />
      <form className="mb-6 grid gap-3 rounded-3xl bg-white p-4 sm:grid-cols-2 xl:grid-cols-4">
        <input name="q" defaultValue={query.q} placeholder="Name, email, phone" className={adminFieldClass} />
        <select name="role" defaultValue={query.role} className={adminFieldClass}>
          <option value="all">All roles</option>
          {USER_ROLES.map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </select>
        <select name="status" defaultValue={query.status} className={adminFieldClass}>
          <option value="all">All status</option>
          <option value="active">Active</option>
          <option value="inactive">Disabled</option>
        </select>
        <Button type="submit" variant="outline">
          Filter
        </Button>
      </form>
      <AdminTable>
          <thead className="bg-cream/80 text-[11px] uppercase tracking-[0.16em] text-ink/45">
            <tr>
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Orders</th>
              <th className="px-4 py-3 font-medium">Spent</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {result.items.map((customer) => (
              <tr key={customer.id} className="border-t border-brand/8">
                <td className="px-4 py-3">
                  <Link href={`/admin/customers/${customer.id}`} className="font-medium hover:text-brand">
                    {customer.name}
                  </Link>
                  <p className="text-xs text-ink/40">{customer.email}</p>
                </td>
                <td className="px-4 py-3">{customer.role}</td>
                <td className="px-4 py-3">{customer.orderCount}</td>
                <td className="px-4 py-3">{formatMoney(customer.totalSpent)}</td>
                <td className="px-4 py-3">
                  <StatusBadge value={customer.isActive ? "ACTIVE" : "INACTIVE"} />
                </td>
                <td className="px-4 py-3 text-right">
                  <ToggleButton
                    href={`/api/admin/customers/${customer.id}`}
                    payload={{ isActive: !customer.isActive }}
                    label={customer.isActive ? "Disable" : "Enable"}
                  />
                </td>
              </tr>
            ))}
          </tbody>
      </AdminTable>
      <div className="mt-6">
        <Pagination page={result.page} pages={result.pages} hrefFor={hrefFor} />
      </div>
    </div>
  );
}
