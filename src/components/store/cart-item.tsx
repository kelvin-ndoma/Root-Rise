"use client";

import Link from "next/link";
import { Trash2 } from "lucide-react";
import { QuantitySelector } from "@/components/ui/quantity-selector";
import { formatMoney } from "@/lib/utils/currency";
import { SafeImage } from "@/components/ui/safe-image";
import type { CartLine } from "@/types";

export function CartItemRow({
  item,
  onQuantity,
  onRemove,
}: {
  item: CartLine;
  onQuantity: (quantity: number) => void;
  onRemove: () => void;
}) {
  return (
    <div className="grid grid-cols-[88px_1fr_auto] items-start gap-4 border-b border-brand/10 py-5">
      <Link href={`/products/${item.slug}`} className="relative h-20 w-20 overflow-hidden rounded-2xl bg-[#efe6d8]">
        <SafeImage src={item.image} alt={item.name} fill className="object-cover" sizes="80px" fallbackLabel="T" />
      </Link>
      <div>
        <Link href={`/products/${item.slug}`} className="font-medium text-ink hover:text-brand">
          {item.name}
        </Link>
        {item.variantLabel ? <p className="mt-1 text-sm text-ink/50">{item.variantLabel}</p> : null}
        <p className="mt-2 text-sm text-brand">{formatMoney(item.unitPrice)}</p>
        <div className="mt-3">
          <QuantitySelector value={item.quantity} max={item.maxQuantity} onChange={onQuantity} />
        </div>
      </div>
      <div className="text-right">
        <p className="font-medium">{formatMoney(item.unitPrice * item.quantity)}</p>
        <button onClick={onRemove} className="mt-3 text-ink/40 hover:text-rose" aria-label="Remove">
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}
