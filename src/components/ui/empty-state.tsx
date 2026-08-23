import Link from "next/link";
import { cn } from "@/lib/utils/cn";

export function EmptyState({
  title,
  description,
  action,
  className,
}: {
  title: string;
  description?: string;
  action?: { href: string; label: string };
  className?: string;
}) {
  return (
    <div className={cn("rounded-3xl border border-dashed border-brand/15 bg-white/70 px-6 py-16 text-center", className)}>
      <h2 className="font-display text-2xl text-brand">{title}</h2>
      {description ? <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-ink/60">{description}</p> : null}
      {action ? (
        <Link
          href={action.href}
          className="mt-6 inline-flex h-11 items-center rounded-full bg-brand px-6 text-sm font-medium text-cream"
        >
          {action.label}
        </Link>
      ) : null}
    </div>
  );
}
