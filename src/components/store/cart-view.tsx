"use client";

import Link from "next/link";
import { useCart } from "@/hooks/use-cart";
import { CartItemRow } from "@/components/store/cart-item";
import { EmptyState } from "@/components/ui/empty-state";
import { formatMoney } from "@/lib/utils/currency";

export function CartView() {
  const { items, setQuantity, remove, totals, hydrated } = useCart();

  if (!hydrated) {
    return <div className="h-64 animate-pulse rounded-3xl bg-white" />;
  }

  if (!items.length) {
    return (
      <EmptyState
        title="Your cart is empty"
        description="Browse Root and Rise’s ingredients, decorations, and baking tools to start your next cake."
        action={{ href: "/shop", label: "Continue shopping" }}
      />
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.4fr_0.8fr]">
      <div className="rounded-3xl bg-white px-5 py-2 shadow-sm">
        {items.map((item) => (
          <CartItemRow
            key={`${item.productId}-${item.variantId ?? "base"}`}
            item={item}
            onQuantity={(quantity) => setQuantity(item.productId, quantity, item.variantId)}
            onRemove={() => remove(item.productId, item.variantId)}
          />
        ))}
      </div>
      <aside className="h-fit rounded-3xl bg-white p-6 shadow-sm">
        <h2 className="font-display text-2xl text-brand">Order summary</h2>
        <dl className="mt-6 space-y-3 text-sm">
          <div className="flex justify-between">
            <dt>Subtotal</dt>
            <dd>{formatMoney(totals.subtotal)}</dd>
          </div>
          <div className="flex justify-between text-ink/60">
            <dt>Delivery</dt>
            <dd>Calculated at checkout</dd>
          </div>
          <div className="flex justify-between text-ink/60">
            <dt>Discount</dt>
            <dd>{formatMoney(0)}</dd>
          </div>
          <div className="flex justify-between border-t border-brand/10 pt-3 text-base font-medium">
            <dt>Total</dt>
            <dd>{formatMoney(totals.total)}</dd>
          </div>
        </dl>
        <Link
          href="/checkout"
          className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-full bg-brand text-sm font-medium text-cream"
        >
          Proceed to checkout
        </Link>
        <Link href="/shop" className="mt-3 inline-flex h-12 w-full items-center justify-center text-sm text-ink/60">
          Continue shopping
        </Link>
      </aside>
    </div>
  );
}
