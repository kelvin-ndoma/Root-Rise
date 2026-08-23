import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { PriceDisplay } from "@/components/ui/price-display";
import { SafeImage } from "@/components/ui/safe-image";
import { AddToCartButton } from "@/components/store/add-to-cart-button";
import { cn } from "@/lib/utils/cn";
import type { SerializedProduct } from "@/types";

export function ProductCard({ product }: { product: SerializedProduct }) {
  const image = product.images[0];
  const outOfStock = product.stockStatus === "OUT_OF_STOCK";

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-brand/10 bg-white transition duration-300 hover:-translate-y-1 hover:border-brand/20 hover:shadow-[0_22px_40px_rgba(92,61,46,0.1)]">
      <div className="relative aspect-[4/5] overflow-hidden bg-[#efe6d8]">
        <Link href={`/products/${product.slug}`} className="absolute inset-0">
          <SafeImage
            src={image?.url}
            alt={image?.alt || product.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover transition duration-700 group-hover:scale-[1.06]"
            fallbackLabel={product.name}
          />
        </Link>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-brand/30 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
        <div className="absolute left-3 top-3 z-10 flex flex-wrap gap-1.5">
          {product.compareAtPrice && product.compareAtPrice > product.price ? (
            <Badge tone="rose">Sale</Badge>
          ) : null}
          {product.isBestSeller ? <Badge tone="brand">Best seller</Badge> : null}
          {product.stockStatus === "LOW_STOCK" ? <Badge tone="warning">Low stock</Badge> : null}
        </div>
        <div className="absolute inset-x-3 bottom-3 z-10 translate-y-2 opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100 max-md:translate-y-0 max-md:opacity-100">
          <AddToCartButton product={product} className="shadow-lg shadow-brand/20" />
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-2 px-3.5 py-3.5">
        {product.category ? (
          <p className="text-[10px] uppercase tracking-[0.2em] text-ink/35">{product.category.name}</p>
        ) : null}
        <Link
          href={`/products/${product.slug}`}
          className="line-clamp-2 min-h-12 font-medium leading-6 text-ink transition hover:text-brand"
        >
          {product.name}
        </Link>
        <div className="mt-auto flex items-end justify-between gap-3 pt-1">
          <PriceDisplay price={product.price} compareAtPrice={product.compareAtPrice} />
          <span
            className={cn(
              "mb-0.5 inline-flex items-center gap-1.5 text-[11px]",
              outOfStock ? "text-ink/40" : product.stockStatus === "LOW_STOCK" ? "text-amber-700" : "text-emerald-700",
            )}
          >
            <span
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                outOfStock ? "bg-ink/30" : product.stockStatus === "LOW_STOCK" ? "bg-amber-500" : "bg-emerald-500",
              )}
            />
            {outOfStock ? "Sold out" : "In stock"}
          </span>
        </div>
      </div>
    </article>
  );
}
