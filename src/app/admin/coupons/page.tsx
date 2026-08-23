import { AdminPageHeader } from "@/components/admin/page-header";
import { CouponForm } from "@/components/admin/coupon-form";
import { StatusBadge } from "@/components/admin/status-badge";
import { ToggleButton } from "@/components/admin/toggle-button";
import { AdminTable } from "@/components/admin/admin-ui";
import { listAdminCoupons } from "@/lib/services/admin.service";
import { formatMoney } from "@/lib/utils/currency";

export const dynamic = "force-dynamic";

export default async function AdminCouponsPage() {
  const coupons = await listAdminCoupons();

  return (
    <div>
      <AdminPageHeader
        eyebrow="Promotions"
        title="Coupons"
        description="Create discount codes and pause them when a campaign ends."
      />
      <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <AdminTable>
            <thead className="bg-cream/80 text-[11px] uppercase tracking-[0.16em] text-ink/45">
              <tr>
                <th className="px-4 py-3 font-medium">Code</th>
                <th className="px-4 py-3 font-medium">Offer</th>
                <th className="px-4 py-3 font-medium">Used</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {coupons.map((coupon) => (
                <tr key={coupon.id} className="border-t border-brand/8">
                  <td className="px-4 py-3 font-medium">{coupon.code}</td>
                  <td className="px-4 py-3">
                    {coupon.type === "PERCENTAGE" ? `${coupon.value}%` : formatMoney(coupon.value)}
                    {coupon.minOrderAmount ? ` over ${formatMoney(coupon.minOrderAmount)}` : ""}
                  </td>
                  <td className="px-4 py-3">
                    {coupon.usedCount}
                    {coupon.usageLimit ? ` / ${coupon.usageLimit}` : ""}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge value={coupon.isActive ? "ACTIVE" : "INACTIVE"} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <ToggleButton
                      href={`/api/admin/coupons/${coupon.id}`}
                      payload={{ isActive: !coupon.isActive }}
                      label={coupon.isActive ? "Pause" : "Activate"}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
        </AdminTable>
        <div>
          <h2 className="mb-4 font-display text-2xl text-brand">New coupon</h2>
          <CouponForm />
        </div>
      </div>
    </div>
  );
}
