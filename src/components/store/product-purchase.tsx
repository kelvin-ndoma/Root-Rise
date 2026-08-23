"use client";

import { useMemo, useState } from "react";
import { Heart } from "lucide-react";
import { QuantitySelector } from "@/components/ui/quantity-selector";
import { Button } from "@/components/ui/button";
import { PriceDisplay } from "@/components/ui/price-display";
import { Badge } from "@/components/ui/badge";
import { AddToCartButton, BuyNowButton } from "@/components/store/add-to-cart-button";
import { stockStatusLabel } from "@/lib/utils/inventory";
import { cn } from "@/lib/utils/cn";
import type { SerializedProduct } from "@/types";

export function ProductPurchase({ product }: { product: SerializedProduct }) {
  const variants = product.variants ?? [];
  const [variantId, setVariantId] = useState(variants[0]?.id);
  const [quantity, setQuantity] = useState(1);
  const selected = variants.find((variant) => variant.id === variantId);

  const price = selected?.price ?? product.price;
  const compareAtPrice = selected?.compareAtPrice ?? product.compareAtPrice;
  const stock = selected?.stock ?? product.stock;
  const status = selected?.stockStatus ?? product.stockStatus;

  const optionGroups = useMemo(() => {
    const groups = new Map<string, string[]>();
    for (const variant of product.variants ?? []) {
      for (const option of variant.options) {
        const values = groups.get(option.name) ?? [];
        if (!values.includes(option.value)) values.push(option.value);
        groups.set(option.name, values);
      }
    }
    return Array.from(groups.entries());
  }, [product.variants]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-ink/40">{product.category?.name}</p>
        <h1 className="mt-2 font-display text-4xl text-brand md:text-5xl">{product.name}</h1>
        <p className="mt-3 text-sm text-ink/50">SKU {selected?.sku ?? product.sku}</p>
      </div>
      <PriceDisplay price={price} compareAtPrice={compareAtPrice} className="text-xl" />
      <div className="flex items-center gap-3">
        <Badge tone={status === "OUT_OF_STOCK" ? "muted" : status === "LOW_STOCK" ? "warning" : "success"}>
          {stockStatusLabel(status)}
        </Badge>
        <span className="text-sm text-ink/50">{stock} available</span>
      </div>

      {optionGroups.map(([name, values]) => (
        <div key={name}>
          <p className="mb-2 text-xs uppercase tracking-[0.16em] text-ink/40">{name}</p>
          <div className="flex flex-wrap gap-2">
            {values.map((value) => {
              const match = variants.find((variant) =>
                variant.options.some((option) => option.name === name && option.value === value),
              );
              const active = selected?.options.some((option) => option.name === name && option.value === value);
              return (
                <button
                  key={value}
                  type="button"
                  disabled={!match}
                  onClick={() => match && setVariantId(match.id)}
                  className={cn(
                    "rounded-full border px-4 py-2 text-sm",
                    active ? "border-brand bg-brand text-cream" : "border-brand/15 hover:border-brand",
                  )}
                >
                  {value}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <QuantitySelector value={quantity} max={Math.max(1, stock)} onChange={setQuantity} />

      <div className="grid gap-3 sm:grid-cols-2">
        <AddToCartButton
          product={product}
          quantity={quantity}
          variantId={selected?.id}
          variantLabel={selected?.label}
          unitPrice={price}
          maxQuantity={stock}
        />
        <BuyNowButton
          product={product}
          quantity={quantity}
          variantId={selected?.id}
          variantLabel={selected?.label}
          unitPrice={price}
          maxQuantity={stock}
        />
      </div>
      <Button variant="ghost" className="justify-start px-0 text-ink/60">
        <Heart size={16} />
        Add to wishlist
      </Button>
    </div>
  );
}
