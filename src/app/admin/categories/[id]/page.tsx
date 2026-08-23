import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/page-header";
import { CategoryForm } from "@/components/admin/category-form";
import { listAdminCategories } from "@/lib/services/admin.service";

export const dynamic = "force-dynamic";

export default async function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const categories = await listAdminCategories();
  const category = categories.find((item) => item.id === id);
  if (!category) notFound();

  return (
    <div>
      <AdminPageHeader eyebrow="Catalogue" title={category.name} description="Update this collection." />
      <CategoryForm categories={categories} category={category} />
    </div>
  );
}
