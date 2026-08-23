import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { SerializedCategory } from "@/types";
import { SafeImage } from "@/components/ui/safe-image";
import { cn } from "@/lib/utils/cn";

export function CategoryCard({
  category,
  featured = false,
}: {
  category: SerializedCategory;
  featured?: boolean;
}) {
  return (
    <Link
      href={`/categories/${category.slug}`}
      className="group relative block overflow-hidden rounded-2xl bg-brand text-cream shadow-[0_12px_30px_rgba(92,61,46,0.08)]"
    >
      <div className={cn("relative", featured ? "aspect-[5/4] lg:min-h-72 lg:aspect-auto" : "aspect-[4/5]")}>
        <SafeImage
          src={category.image?.url}
          alt={category.image?.alt || category.name}
          fill
          sizes="(max-width: 768px) 50vw, 20vw"
          className="object-cover opacity-75 transition duration-700 group-hover:scale-105 group-hover:opacity-90"
          fallbackLabel={category.name}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand via-brand/35 to-transparent" />
        <div className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-cream/15 text-cream opacity-0 backdrop-blur-sm transition group-hover:opacity-100">
          <ArrowUpRight size={16} />
        </div>
        <div className="absolute inset-x-0 bottom-0 p-4 md:p-5">
          <p className="text-[10px] uppercase tracking-[0.2em] text-accent">Collection</p>
          <h3 className={cn("mt-1 font-display leading-tight", featured ? "text-2xl md:text-4xl" : "text-xl md:text-2xl")}>
            {category.name}
          </h3>
          {category.description && featured ? (
            <p className="mt-2 hidden max-w-sm text-sm leading-6 text-cream/75 md:line-clamp-2 md:block">
              {category.description}
            </p>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
