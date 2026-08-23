import { cn } from "@/lib/utils/cn";

export function LoadingState({ className, label = "Loading" }: { className?: string; label?: string }) {
  return (
    <div className={cn("grid gap-6", className)} aria-busy="true" aria-label={label}>
      <div className="h-64 animate-pulse rounded-3xl bg-brand/5" />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-72 animate-pulse rounded-3xl bg-brand/5" />
        ))}
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="h-80 animate-pulse rounded-3xl bg-brand/5" />
      ))}
    </div>
  );
}
