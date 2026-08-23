import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { ToggleButton } from "@/components/admin/toggle-button";
import { Pagination } from "@/components/ui/pagination";
import { AdminTable, adminFieldClass } from "@/components/admin/admin-ui";
import { listAdminCategories, listAdminProducts } from "@/lib/services/admin.service";
import { adminProductListQuerySchema } from "@/lib/validations/admin";
import { formatMoney } from "@/lib/utils/currency";

export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function first(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AdminProductsPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const query = adminProductListQuerySchema.parse({
    q: first(params.q),
    category: first(params.category),
    status: first(params.status),
    page: first(params.page),
  });
  const [result, categories] = await Promise.all([listAdminProducts(query), listAdminCategories()]);

  const hrefFor = (page: number) => {
    const next = new URLSearchParams();
    if (query.q) next.set("q", query.q);
    if (query.category) next.set("category", query.category);
    if (query.status && query.status !== "all") next.set("status", query.status);
    next.set("page", String(page));
    return `/admin/products?${next.toString()}`;
  };

  return (
    <div>
      <AdminPageHeader
        eyebrow="Catalogue"
        title="Products"
        description="Create, publish, and restock cake ingredients and tools."
        actions={
          <Link
            href="/admin/products/new"
            className="inline-flex h-11 w-full items-center justify-center rounded-full bg-brand px-6 text-sm font-medium text-cream sm:w-auto"
          >
            Add product
          </Link>
        }
      />
      <form className="mb-6 grid gap-3 rounded-3xl bg-white p-4 sm:grid-cols-2 xl:grid-cols-4">
        <input name="q" defaultValue={query.q} placeholder="Search name or SKU" className={adminFieldClass} />
        <select name="category" defaultValue={query.category ?? ""} className={adminFieldClass}>
          <option value="">All categories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        <select name="status" defaultValue={query.status} className={adminFieldClass}>
          <option value="all">All status</option>
          <option value="active">Published</option>
          <option value="inactive">Hidden</option>
          <option value="low-stock">Low stock</option>
        </select>
        <button type="submit" className="h-11 rounded-full border border-brand/20 px-6 text-sm text-brand">
          Filter
        </button>
      </form>
      <AdminTable>
          <thead className="bg-cream/80 text-[11px] uppercase tracking-[0.16em] text-ink/45">
            <tr>
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="px-4 py-3 font-medium">SKU</th>
              <th className="px-4 py-3 font-medium">Price</th>
              <th className="px-4 py-3 font-medium">Stock</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {result.items.map((product) => (
              <tr key={product.id} className="border-t border-brand/8">
                <td className="px-4 py-3">
                  <Link href={`/admin/products/${product.id}`} className="font-medium hover:text-brand">
                    {product.name}
                  </Link>
                  <p className="text-xs text-ink/40">{product.category?.name}</p>
                </td>
                <td className="px-4 py-3 text-ink/60">{product.sku}</td>
                <td className="px-4 py-3">{formatMoney(product.price)}</td>
                <td className="px-4 py-3">{product.stock}</td>
                <td className="px-4 py-3">
                  <StatusBadge value={product.isActive === false ? "INACTIVE" : "ACTIVE"} />
                </td>
                <td className="px-4 py-3 text-right">
                  <ToggleButton
                    href={`/api/admin/products/${product.id}`}
                    payload={{ isActive: product.isActive === false }}
                    label={product.isActive === false ? "Publish" : "Hide"}
                  />
                </td>
              </tr>
            ))}
          </tbody>
      </AdminTable>
      {!result.items.length ? <p className="px-4 py-10 text-center text-sm text-ink/50">No products match these filters.</p> : null}
      <div className="mt-6">
        <Pagination page={result.page} pages={result.pages} hrefFor={hrefFor} />
      </div>
    </div>
  );
}
