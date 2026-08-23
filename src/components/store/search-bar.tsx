"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { formatMoney } from "@/lib/utils/currency";

type Suggestion = {
  name: string;
  slug: string;
  price: number;
  image?: string;
};

export function SearchBar({
  defaultValue = "",
  className,
}: {
  defaultValue?: string;
  className?: string;
}) {
  const router = useRouter();
  const [q, setQ] = useState(defaultValue);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const ready = q.trim().length >= 2;

  useEffect(() => {
    if (!ready) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      const response = await fetch(`/api/search?q=${encodeURIComponent(q)}&limit=5`, {
        signal: controller.signal,
      });
      if (response.ok) {
        const data = (await response.json()) as { items: Suggestion[] };
        setSuggestions(data.items);
        setOpen(true);
      }
    }, 220);
    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [q, ready]);

  const visible = ready ? suggestions : [];

  return (
    <form
      className={className}
      onSubmit={(event) => {
        event.preventDefault();
        setOpen(false);
        router.push(`/search?q=${encodeURIComponent(q.trim())}`);
      }}
    >
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-ink/40" />
        <Input
          value={q}
          onChange={(event) => setQ(event.target.value)}
          placeholder="Search ingredients, tools, SKU..."
          className="h-12 rounded-full border-brand/10 bg-cream/70 pl-11"
          onFocus={() => visible.length && setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
        />
        {open && visible.length ? (
          <div className="absolute z-30 mt-2 w-full overflow-hidden rounded-2xl border border-brand/10 bg-white shadow-xl">
            {visible.map((item) => (
              <Link
                key={item.slug}
                href={`/products/${item.slug}`}
                className="flex items-center justify-between px-4 py-3 text-sm hover:bg-cream"
              >
                <span>{item.name}</span>
                <span className="text-ink/50">{formatMoney(item.price)}</span>
              </Link>
            ))}
          </div>
        ) : null}
      </div>
    </form>
  );
}
