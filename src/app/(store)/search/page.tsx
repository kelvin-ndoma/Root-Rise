import type { Metadata } from "next";
import { ProductGrid } from "@/components/store/product-grid";
import { Pagination } from "@/components/ui/pagination";
import { EmptyState } from "@/components/ui/empty-state";
import { SearchBar } from "@/components/store/search-bar";
import { listProducts } from "@/lib/services/product.service";
import { productListQuerySchema } from "@/lib/validations/product";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Search",
  description: "Search Root and Rise products by name, SKU, category, or description.",
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function first(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function SearchPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const q = first(params.q) ?? "";
  const parsed = productListQuerySchema.parse({
    q,
    sort: first(params.sort) ?? "featured",
    page: first(params.page),
  });
  const result = q.trim()
    ? await listProducts(parsed)
    : { items: [], total: 0, page: 1, pages: 1, limit: 12 };

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <h1 className="font-display text-5xl text-brand">Search</h1>
      <div className="mt-6 max-w-xl">
        <SearchBar defaultValue={q} />
      </div>
      {q.trim() ? (
        <>
          <p className="mt-6 text-sm text-ink/50">
            {result.total} result{result.total === 1 ? "" : "s"} for “{q}”
          </p>
          <div className="mt-8">
            {result.items.length ? (
              <ProductGrid products={result.items} />
            ) : (
              <EmptyState
                title="No matching products"
                description="Try a product name, SKU, or category such as fondant, sprinkles, or piping tips."
                action={{ href: "/shop", label: "Browse the shop" }}
              />
            )}
          </div>
          <div className="mt-10">
            <Pagination
              page={result.page}
              pages={result.pages}
              hrefFor={(page) => `/search?q=${encodeURIComponent(q)}&page=${page}`}
            />
          </div>
        </>
      ) : (
        <p className="mt-8 text-ink/50">Start typing to find ingredients, tools, and packaging.</p>
      )}
    </div>
  );
}
