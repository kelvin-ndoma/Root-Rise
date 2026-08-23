import { cn } from "@/lib/utils/cn";

export function BrandMark({
  className,
  inverted = false,
}: {
  className?: string;
  inverted?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span
        className={cn(
          "grid h-9 w-9 shrink-0 place-items-center rounded-full border text-[11px] tracking-[0.18em]",
          inverted ? "border-cream/30 text-cream" : "border-brand/20 text-brand",
        )}
      >
        R
      </span>
      <span
        className={cn(
          "font-display text-[1.35rem] leading-none tracking-[0.04em] sm:text-[1.65rem] md:text-[1.85rem]",
          inverted ? "text-cream" : "text-brand",
        )}
      >
        Root and Rise
      </span>
    </span>
  );
}
