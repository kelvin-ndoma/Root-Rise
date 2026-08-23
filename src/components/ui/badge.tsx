import { cn } from "@/lib/utils/cn";
import type { HTMLAttributes } from "react";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: "brand" | "accent" | "rose" | "success" | "warning" | "muted";
};

const tones = {
  brand: "bg-brand text-cream",
  accent: "bg-accent/20 text-brand-dark",
  rose: "bg-rose/15 text-rose",
  success: "bg-emerald-50 text-emerald-800",
  warning: "bg-amber-50 text-amber-800",
  muted: "bg-ink/5 text-ink/70",
};

export function Badge({ className, tone = "muted", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex max-w-full items-center rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] sm:px-2.5 sm:text-[11px] sm:tracking-[0.14em]",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
