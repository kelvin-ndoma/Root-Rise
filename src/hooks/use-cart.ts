"use client";

import { useCallback } from "react";
import { useSession } from "next-auth/react";
import { cartTotals, useCartStore } from "@/lib/store/cart-store";
import type { CartLine } from "@/types";
import { useToast } from "@/hooks/use-toast";

async function syncCart(payload: unknown, method = "POST") {
  const response = await fetch("/api/cart", {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const data = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(data?.error ?? "Could not update your cart.");
  }
  return (await response.json()) as { items: CartLine[] };
}

export function useCart() {
  const { data: session } = useSession();
  const toast = useToast();
  const items = useCartStore((state) => state.items);
  const addItem = useCartStore((state) => state.addItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const replace = useCartStore((state) => state.replace);
  const hydrated = useCartStore((state) => state.hydrated);

  const add = useCallback(
    async (line: CartLine) => {
      addItem(line);
      toast({ title: "Added to cart", description: line.name });
      if (session?.user) {
        try {
          const next = await syncCart({
            productId: line.productId,
            variantId: line.variantId,
            quantity: line.quantity,
          });
          replace(next.items);
        } catch (error) {
          toast({
            title: "Cart saved locally",
            description: error instanceof Error ? error.message : "We will sync after you sign in.",
          });
        }
      }
    },
    [addItem, replace, session?.user, toast],
  );

  const setQuantity = useCallback(
    async (productId: string, quantity: number, variantId?: string) => {
      updateQuantity(productId, quantity, variantId);
      if (session?.user) {
        const next = await syncCart({ productId, variantId, quantity }, "PATCH");
        replace(next.items);
      }
    },
    [replace, session?.user, updateQuantity],
  );

  const remove = useCallback(
    async (productId: string, variantId?: string) => {
      removeItem(productId, variantId);
      if (session?.user) {
        const next = await syncCart({ productId, variantId, quantity: 0 }, "PATCH");
        replace(next.items);
      }
    },
    [removeItem, replace, session?.user],
  );

  return {
    items,
    hydrated,
    add,
    setQuantity,
    remove,
    totals: cartTotals(items),
  };
}
