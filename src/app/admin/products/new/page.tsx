import { AdminPageHeader } from "@/components/admin/page-header";
import { ProductForm } from "@/components/admin/product-form";
import { listAdminCategories } from "@/lib/services/admin.service";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const categories = await listAdminCategories();
  return (
    <div>
      <AdminPageHeader eyebrow="Catalogue" title="New product" description="Add an ingredient, decoration, or tool to the shop." />
      <ProductForm categories={categories} />
    </div>
  );
}
