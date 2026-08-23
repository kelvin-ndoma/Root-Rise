import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/page-header";
import { CategoryForm } from "@/components/admin/category-form";
import { StatusBadge } from "@/components/admin/status-badge";
import { ToggleButton } from "@/components/admin/toggle-button";
import { AdminTable } from "@/components/admin/admin-ui";
import { listAdminCategories } from "@/lib/services/admin.service";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const categories = await listAdminCategories();

  return (
    <div>
      <AdminPageHeader
        eyebrow="Catalogue"
        title="Categories"
        description="Organise the shop and control which collections appear on the storefront."
      />
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <AdminTable>
            <thead className="bg-cream/80 text-[11px] uppercase tracking-[0.16em] text-ink/45">
              <tr>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Products</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.id} className="border-t border-brand/8">
                  <td className="px-4 py-3">
                    <Link href={`/admin/categories/${category.id}`} className="font-medium hover:text-brand">
                      {category.name}
                    </Link>
                    <p className="text-xs text-ink/40">{category.slug}</p>
                  </td>
                  <td className="px-4 py-3">{category.productCount ?? 0}</td>
                  <td className="px-4 py-3">
                    <StatusBadge value={category.isActive ? "ACTIVE" : "INACTIVE"} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <ToggleButton
                      href={`/api/admin/categories/${category.id}`}
                      payload={{ isActive: !category.isActive }}
                      label={category.isActive ? "Hide" : "Show"}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
        </AdminTable>
        <div>
          <h2 className="mb-4 font-display text-2xl text-brand">Add category</h2>
          <CategoryForm categories={categories} />
        </div>
      </div>
    </div>
  );
}
