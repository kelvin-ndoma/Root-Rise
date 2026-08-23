import type { Metadata } from "next";
import { CartView } from "@/components/store/cart-view";

export const metadata: Metadata = {
  title: "Cart",
  description: "Review the items in your Root and Rise cart.",
};

export default function CartPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <h1 className="mb-8 font-display text-5xl text-brand">Your cart</h1>
      <CartView />
    </div>
  );
}
