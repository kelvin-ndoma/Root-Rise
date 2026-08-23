import type { StockStatus } from "@/types";

export function getStockStatus(
  stock: number,
  lowStockThreshold = 5,
): StockStatus {
  if (stock <= 0) return "OUT_OF_STOCK";
  if (stock <= lowStockThreshold) return "LOW_STOCK";
  return "IN_STOCK";
}

export function stockStatusLabel(status: StockStatus) {
  switch (status) {
    case "IN_STOCK":
      return "In stock";
    case "LOW_STOCK":
      return "Low stock";
    case "OUT_OF_STOCK":
      return "Out of stock";
  }
}
