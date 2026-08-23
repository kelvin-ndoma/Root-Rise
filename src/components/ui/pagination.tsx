import Link from "next/link";
import { cn } from "@/lib/utils/cn";

export function Pagination({
  page,
  pages,
  hrefFor,
}: {
  page: number;
  pages: number;
  hrefFor: (page: number) => string;
}) {
  if (pages <= 1) return null;
  const items = Array.from({ length: pages }, (_, index) => index + 1).filter(
    (item) => item === 1 || item === pages || Math.abs(item - page) <= 1,
  );

  return (
    <nav className="flex flex-wrap items-center justify-center gap-2" aria-label="Pagination">
      {page > 1 ? (
        <Link href={hrefFor(page - 1)} className="rounded-full px-3 py-2 text-sm text-ink/70 hover:text-brand">
          Previous
        </Link>
      ) : null}
      {items.map((item, index) => {
        const prev = items[index - 1];
        return (
          <span key={item} className="flex items-center gap-2">
            {prev && item - prev > 1 ? <span className="text-ink/40">…</span> : null}
            <Link
              href={hrefFor(item)}
              className={cn(
                "grid h-10 w-10 place-items-center rounded-full text-sm",
                item === page ? "bg-brand text-cream" : "text-ink/70 hover:bg-brand/5",
              )}
            >
              {item}
            </Link>
          </span>
        );
      })}
      {page < pages ? (
        <Link href={hrefFor(page + 1)} className="rounded-full px-3 py-2 text-sm text-ink/70 hover:text-brand">
          Next
        </Link>
      ) : null}
    </nav>
  );
}
