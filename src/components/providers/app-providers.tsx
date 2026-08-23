"use client";

import { SessionProvider, useSession } from "next-auth/react";
import { useEffect, useRef } from "react";
import { ToastViewport } from "@/components/ui/toast";
import { useCartStore } from "@/lib/store/cart-store";
import type { CartLine } from "@/types";

function CartSync() {
  const { status } = useSession();
  const replace = useCartStore((state) => state.replace);
  const items = useCartStore((state) => state.items);
  const hydrated = useCartStore((state) => state.hydrated);
  const merged = useRef(false);

  useEffect(() => {
    if (status !== "authenticated" || !hydrated || merged.current) return;
    merged.current = true;
    const guestItems = items;
    void (async () => {
      if (guestItems.length) {
        await fetch("/api/cart", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items: guestItems }),
        });
      }
      const response = await fetch("/api/cart");
      if (response.ok) {
        const data = (await response.json()) as { items: CartLine[] };
        replace(data.items);
      }
    })();
  }, [hydrated, items, replace, status]);

  return null;
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <CartSync />
      {children}
      <ToastViewport />
    </SessionProvider>
  );
}
