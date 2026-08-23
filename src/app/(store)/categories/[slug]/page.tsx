import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { ProductFilters } from "@/components/store/product-filters";
import { ProductGrid } from "@/components/store/product-grid";
import { Pagination } from "@/components/ui/pagination";
import { getCategoryBySlug, getChildCategories, getNavCategories } from "@/lib/services/category.service";
import { listProducts } from "@/lib/services/product.service";
import { productListQuerySchema } from "@/lib/validations/product";
import { siteConfig } from "@/config/site";
import Link from "next/link";
import { SafeImage } from "@/components/ui/safe-image";

export const dynamic = "force-dynamic";

type Params = Promise<{ slug: string }>;
type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function first(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug).catch(() => null);
  if (!category) return { title: "Category" };
  return {
    title: category.name,
    description: category.description || `Shop ${category.name} at ${siteConfig.name}.`,
    alternates: { canonical: `/categories/${category.slug}` },
    openGraph: {
      title: `${category.name} | ${siteConfig.name}`,
      description: category.description,
      images: category.image?.url ? [{ url: category.image.url }] : undefined,
    },
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const queryParams = await searchParams;
  const parsed = productListQuerySchema.parse({
    q: first(queryParams.q),
    category: slug,
    minPrice: first(queryParams.minPrice),
    maxPrice: first(queryParams.maxPrice),
    availability: first(queryParams.availability),
    sort: first(queryParams.sort),
    page: first(queryParams.page),
  });

  const [result, navCategories, children] = await Promise.all([
    listProducts(parsed),
    getNavCategories(),
    getChildCategories(category.id),
  ]);

  const hrefFor = (page: number) => {
    const next = new URLSearchParams();
    if (parsed.q) next.set("q", parsed.q);
    if (parsed.minPrice != null) next.set("minPrice", String(parsed.minPrice));
    if (parsed.maxPrice != null) next.set("maxPrice", String(parsed.maxPrice));
    if (parsed.availability && parsed.availability !== "all") next.set("availability", parsed.availability);
    if (parsed.sort) next.set("sort", parsed.sort);
    next.set("page", String(page));
    return `/categories/${slug}?${next.toString()}`;
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <Breadcrumbs items={[{ href: "/", label: "Home" }, { href: "/shop", label: "Shop" }, { label: category.name }]} />
      <div className="mt-6 grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
        <div>
          <h1 className="font-display text-5xl text-brand">{category.name}</h1>
          {category.description ? <p className="mt-4 max-w-2xl text-ink/65">{category.description}</p> : null}
          <p className="mt-3 text-sm text-ink/45">{result.total} products</p>
        </div>
        {category.image?.url ? (
          <div className="relative min-h-56 overflow-hidden rounded-[1.8rem]">
            <SafeImage src={category.image.url} alt={category.name} fill className="object-cover" sizes="40vw" fallbackLabel={category.name} />
          </div>
        ) : null}
      </div>
      {children.length ? (
        <div className="mt-8 flex flex-wrap gap-2">
          {children.map((child) => (
            <Link
              key={child.id}
              href={`/categories/${child.slug}`}
              className="rounded-full border border-brand/15 px-4 py-2 text-sm hover:border-brand"
            >
              {child.name}
            </Link>
          ))}
        </div>
      ) : null}
      <div className="mt-10 grid gap-8 lg:grid-cols-[280px_1fr]">
        <ProductFilters
          action={`/categories/${slug}`}
          categories={navCategories}
          values={{
            q: parsed.q,
            category: slug,
            minPrice: parsed.minPrice != null ? String(parsed.minPrice) : undefined,
            maxPrice: parsed.maxPrice != null ? String(parsed.maxPrice) : undefined,
            availability: parsed.availability,
            sort: parsed.sort,
          }}
        />
        <div>
          <ProductGrid products={result.items} />
          <div className="mt-10">
            <Pagination page={result.page} pages={result.pages} hrefFor={hrefFor} />
          </div>
        </div>
      </div>
    </div>
  );
}
