import { ProductFilters } from "@/components/store/product-filters";
import { ProductGrid } from "@/components/store/product-grid";
import { Pagination } from "@/components/ui/pagination";
import { getNavCategories } from "@/lib/services/category.service";
import { listProducts } from "@/lib/services/product.service";
import { productListQuerySchema } from "@/lib/validations/product";
import { siteConfig } from "@/config/site";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Shop",
  description: `Browse ${siteConfig.name} cake ingredients, decorations, chocolates, packaging, and baking tools.`,
  alternates: { canonical: "/shop" },
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function first(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function ShopPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const parsed = productListQuerySchema.parse({
    q: first(params.q),
    category: first(params.category),
    minPrice: first(params.minPrice),
    maxPrice: first(params.maxPrice),
    availability: first(params.availability),
    sort: first(params.sort),
    page: first(params.page),
    limit: first(params.limit) ?? "12",
  });

  let result;
  let categories;
  try {
    [result, categories] = await Promise.all([listProducts(parsed), getNavCategories()]);
  } catch (error) {
    const message =
      error instanceof Error && error.message.includes("MONGODB_URI is not configured")
        ? "The live site has no MONGODB_URI. Add it in Vercel Production env vars."
        : "The live site cannot reach MongoDB. Allow 0.0.0.0/0 in Atlas Network Access and use the same MONGODB_URI you seed locally.";
    return (
      <div className="mx-auto max-w-3xl px-6 py-16">
        <p className="text-[11px] uppercase tracking-[0.22em] text-accent">Catalogue</p>
        <h1 className="mt-2 font-display text-4xl text-brand">Shop {siteConfig.name}</h1>
        <p className="mt-4 text-sm leading-6 text-ink/65">{message}</p>
        <p className="mt-2 text-sm text-ink/45">
          Open <code className="rounded bg-white px-1.5 py-0.5">/api/health</code> on this domain to confirm the database connection.
        </p>
      </div>
    );
  }

  const hrefFor = (page: number) => {
    const next = new URLSearchParams();
    if (parsed.q) next.set("q", parsed.q);
    if (parsed.category) next.set("category", parsed.category);
    if (parsed.minPrice != null) next.set("minPrice", String(parsed.minPrice));
    if (parsed.maxPrice != null) next.set("maxPrice", String(parsed.maxPrice));
    if (parsed.availability && parsed.availability !== "all") next.set("availability", parsed.availability);
    if (parsed.sort) next.set("sort", parsed.sort);
    next.set("page", String(page));
    return `/shop?${next.toString()}`;
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <p className="text-[11px] uppercase tracking-[0.22em] text-accent">Catalogue</p>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-display text-5xl text-brand">Shop {siteConfig.name}</h1>
        <p className="rounded-full bg-white px-4 py-2 text-sm text-ink/50">{result.total} products</p>
      </div>
      <div className="mt-10 grid gap-8 lg:grid-cols-[280px_1fr]">
        <ProductFilters
          action="/shop"
          categories={categories}
          values={{
            q: parsed.q,
            category: parsed.category,
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
