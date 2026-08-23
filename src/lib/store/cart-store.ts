"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartLine } from "@/types";

type CartState = {
  items: CartLine[];
  couponCode?: string;
  hydrated: boolean;
  setHydrated: (value: boolean) => void;
  replace: (items: CartLine[]) => void;
  addItem: (item: CartLine) => void;
  updateQuantity: (productId: string, quantity: number, variantId?: string) => void;
  removeItem: (productId: string, variantId?: string) => void;
  clear: () => void;
  setCoupon: (code?: string) => void;
};

function sameLine(a: CartLine, productId: string, variantId?: string) {
  return a.productId === productId && a.variantId === variantId;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      couponCode: undefined,
      hydrated: false,
      setHydrated: (value) => set({ hydrated: value }),
      replace: (items) => set({ items }),
      addItem: (item) => {
        const existing = get().items.find((line) =>
          sameLine(line, item.productId, item.variantId),
        );
        if (!existing) {
          set({ items: [...get().items, item] });
          return;
        }
        const quantity = Math.min(existing.quantity + item.quantity, existing.maxQuantity);
        set({
          items: get().items.map((line) =>
            sameLine(line, item.productId, item.variantId) ? { ...line, quantity } : line,
          ),
        });
      },
      updateQuantity: (productId, quantity, variantId) => {
        if (quantity <= 0) {
          set({
            items: get().items.filter((line) => !sameLine(line, productId, variantId)),
          });
          return;
        }
        set({
          items: get().items.map((line) =>
            sameLine(line, productId, variantId)
              ? { ...line, quantity: Math.min(quantity, line.maxQuantity) }
              : line,
          ),
        });
      },
      removeItem: (productId, variantId) =>
        set({
          items: get().items.filter((line) => !sameLine(line, productId, variantId)),
        }),
      clear: () => set({ items: [], couponCode: undefined }),
      setCoupon: (code) => set({ couponCode: code }),
    }),
    {
      name: "root-and-rise-cart",
      partialize: (state) => ({ items: state.items, couponCode: state.couponCode }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    },
  ),
);

export function cartTotals(items: CartLine[], deliveryFee = 0, discount = 0) {
  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const total = Math.max(0, subtotal + deliveryFee - discount);
  const count = items.reduce((sum, item) => sum + item.quantity, 0);
  return { subtotal, deliveryFee, discount, total, count };
}
