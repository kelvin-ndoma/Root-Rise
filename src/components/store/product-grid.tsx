import { ProductCard } from "@/components/store/product-card";
import { EmptyState } from "@/components/ui/empty-state";
import type { SerializedProduct } from "@/types";

export function ProductGrid({ products }: { products: SerializedProduct[] }) {
  if (!products.length) {
    return (
      <EmptyState
        title="No products found"
        description="Try a different search or browse our categories."
        action={{ href: "/shop", label: "Browse the shop" }}
      />
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
