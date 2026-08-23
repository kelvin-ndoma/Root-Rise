"use client";

import Link from "next/link";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import type { SerializedProduct } from "@/types";

export function AddToCartButton({
  product,
  quantity = 1,
  variantId,
  variantLabel,
  unitPrice,
  maxQuantity,
  label = "Add to cart",
  className,
}: {
  product: Pick<SerializedProduct, "id" | "name" | "slug" | "images" | "price" | "stock">;
  quantity?: number;
  variantId?: string;
  variantLabel?: string;
  unitPrice?: number;
  maxQuantity?: number;
  label?: string;
  className?: string;
}) {
  const { add } = useCart();
  const available = maxQuantity ?? product.stock;

  return (
    <Button
      size="sm"
      disabled={available <= 0}
      className={cn("w-full", className)}
      onClick={() =>
        add({
          productId: product.id,
          variantId,
          slug: product.slug,
          name: product.name,
          image: product.images[0]?.url,
          variantLabel,
          unitPrice: unitPrice ?? product.price,
          quantity,
          maxQuantity: available,
        })
      }
    >
      {available <= 0 ? "Out of stock" : label}
    </Button>
  );
}

export function BuyNowButton({
  product,
  quantity = 1,
  variantId,
  variantLabel,
  unitPrice,
  maxQuantity,
}: {
  product: Pick<SerializedProduct, "id" | "name" | "slug" | "images" | "price" | "stock">;
  quantity?: number;
  variantId?: string;
  variantLabel?: string;
  unitPrice?: number;
  maxQuantity?: number;
}) {
  const { add } = useCart();
  const available = maxQuantity ?? product.stock;

  return (
    <Link
      href="/checkout"
      className="inline-flex h-12 w-full items-center justify-center rounded-full border border-brand/20 text-sm font-medium text-brand transition hover:bg-brand/5"
      onClick={() =>
        add({
          productId: product.id,
          variantId,
          slug: product.slug,
          name: product.name,
          image: product.images[0]?.url,
          variantLabel,
          unitPrice: unitPrice ?? product.price,
          quantity,
          maxQuantity: available,
        })
      }
    >
      Buy now
    </Link>
  );
}
