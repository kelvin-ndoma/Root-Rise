import { Footer } from "@/components/store/footer";
import { Navbar } from "@/components/store/navbar";
import { getNavCategories } from "@/lib/services/category.service";
import type { SerializedCategory } from "@/types";

export const dynamic = "force-dynamic";

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  let categories: SerializedCategory[] = [];
  try {
    categories = await getNavCategories();
  } catch {
    categories = [];
  }

  return (
    <div className="flex min-h-full flex-col">
      <Navbar categories={categories} />
      <main className="flex-1">{children}</main>
      <Footer categories={categories} />
    </div>
  );
}
