import { Badge } from "@/components/ui/badge";

const tones: Record<string, "brand" | "accent" | "rose" | "success" | "warning" | "muted"> = {
  PENDING: "warning",
  CONFIRMED: "accent",
  PROCESSING: "brand",
  READY_FOR_DELIVERY: "brand",
  OUT_FOR_DELIVERY: "accent",
  DELIVERED: "success",
  CANCELLED: "rose",
  PAID: "success",
  FAILED: "rose",
  REFUNDED: "muted",
  ACTIVE: "success",
  INACTIVE: "muted",
  LOW_STOCK: "warning",
  OUT_OF_STOCK: "rose",
  IN_STOCK: "success",
};

export function StatusBadge({ value }: { value: string }) {
  return <Badge tone={tones[value] ?? "muted"}>{value.replaceAll("_", " ")}</Badge>;
}
