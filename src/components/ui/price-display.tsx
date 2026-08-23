import { calcSalePercent, formatMoney } from "@/lib/utils/currency";
import { cn } from "@/lib/utils/cn";

export function PriceDisplay({
  price,
  compareAtPrice,
  className,
}: {
  price: number;
  compareAtPrice?: number | null;
  className?: string;
}) {
  const sale = calcSalePercent(price, compareAtPrice);
  return (
    <div className={cn("flex items-baseline gap-2", className)}>
      <span className="font-medium text-brand">{formatMoney(price)}</span>
      {sale ? (
        <>
          <span className="text-sm text-ink/40 line-through">{formatMoney(compareAtPrice!)}</span>
          <span className="text-xs font-semibold text-rose">-{sale}%</span>
        </>
      ) : null}
    </div>
  );
}
