import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/page-header";
import { ProductForm } from "@/components/admin/product-form";
import { getAdminProduct, listAdminCategories } from "@/lib/services/admin.service";

export const dynamic = "force-dynamic";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [product, categories] = await Promise.all([getAdminProduct(id), listAdminCategories()]);
  if (!product) notFound();

  return (
    <div>
      <AdminPageHeader eyebrow="Catalogue" title={product.name} description={`SKU ${product.sku}`} />
      <ProductForm categories={categories} product={product} />
    </div>
  );
}
