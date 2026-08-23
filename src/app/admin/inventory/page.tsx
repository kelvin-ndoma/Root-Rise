import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/page-header";
import { InventoryForm } from "@/components/admin/inventory-form";
import { StatusBadge } from "@/components/admin/status-badge";
import { listAdminProducts, listInventory, listLowStockProducts } from "@/lib/services/admin.service";

export const dynamic = "force-dynamic";

export default async function AdminInventoryPage() {
  const [products, lowStock, history] = await Promise.all([
    listAdminProducts({ page: 1, limit: 100, status: "all" }),
    listLowStockProducts(),
    listInventory(30),
  ]);

  return (
    <div>
      <AdminPageHeader
        eyebrow="Stock"
        title="Inventory"
        description="Restock products and keep an audit trail of every change."
      />
      <InventoryForm products={products.items.filter((product) => !product.hasVariants)} />
      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <section className="rounded-3xl bg-white p-4 sm:p-6">
          <h2 className="font-display text-2xl text-brand">Needs restock</h2>
          <div className="mt-4 space-y-3">
            {lowStock.map((product) => (
              <Link
                key={product.id}
                href={`/admin/products/${product.id}`}
                className="flex items-center justify-between gap-3 rounded-2xl bg-cream/80 px-4 py-3 text-sm hover:bg-cream"
              >
                <span className="min-w-0 truncate">{product.name}</span>
                <StatusBadge value={product.stockStatus} />
              </Link>
            ))}
            {!lowStock.length ? <p className="text-sm text-ink/50">Nothing is below its threshold.</p> : null}
          </div>
        </section>
        <section className="rounded-3xl bg-white p-4 sm:p-6">
          <h2 className="font-display text-2xl text-brand">Recent movements</h2>
          <div className="mt-4 space-y-3">
            {history.map((row) => (
              <div key={row.id} className="rounded-2xl bg-cream/80 px-4 py-3 text-sm">
                <p className="font-medium">
                  {row.product?.name ?? "Product"} · {row.type} {row.quantity > 0 ? `+${row.quantity}` : row.quantity}
                </p>
                <p className="text-ink/45">
                  {new Date(row.createdAt).toLocaleString()}
                  {row.note ? ` · ${row.note}` : ""}
                </p>
              </div>
            ))}
            {!history.length ? <p className="text-sm text-ink/50">No inventory history yet.</p> : null}
          </div>
        </section>
      </div>
    </div>
  );
}
