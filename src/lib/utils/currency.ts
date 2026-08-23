import { siteConfig } from "@/config/site";

export function formatMoney(
  amount: number,
  currency: string = siteConfig.currency,
): string {
  return new Intl.NumberFormat(siteConfig.locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function calcSalePercent(price: number, compareAtPrice?: number | null) {
  if (!compareAtPrice || compareAtPrice <= price) return null;
  return Math.round(((compareAtPrice - price) / compareAtPrice) * 100);
}
