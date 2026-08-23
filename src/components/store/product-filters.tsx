import Link from "next/link";
import { Input } from "@/components/ui/input";
import type { SerializedCategory } from "@/types";
import type { AvailabilityFilter, ProductSort } from "@/types";

const sorts: { value: ProductSort; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "best-selling", label: "Best Selling" },
];

export function ProductFilters({
  categories,
  values,
  action,
}: {
  categories: SerializedCategory[];
  values: {
    q?: string;
    category?: string;
    minPrice?: string;
    maxPrice?: string;
    availability?: AvailabilityFilter;
    sort?: ProductSort;
  };
  action: string;
}) {
  return (
    <form action={action} className="grid h-fit gap-6 rounded-[1.6rem] border border-brand/10 bg-white p-5 shadow-[0_10px_30px_rgba(92,61,46,0.04)]">
      <div>
        <label className="text-[11px] uppercase tracking-[0.16em] text-ink/40">Search</label>
        <Input name="q" defaultValue={values.q} className="mt-2" placeholder="Name, SKU or description" />
      </div>
      <div>
        <p className="text-[11px] uppercase tracking-[0.16em] text-ink/40">Category</p>
        <div className="mt-3 flex flex-col gap-2 text-sm">
          <label className="flex items-center gap-2">
            <input type="radio" name="category" value="" defaultChecked={!values.category} />
            All categories
          </label>
          {categories.map((category) => (
            <label key={category.id} className="flex items-center gap-2">
              <input
                type="radio"
                name="category"
                value={category.slug}
                defaultChecked={values.category === category.slug}
              />
              {category.name}
            </label>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[11px] uppercase tracking-[0.16em] text-ink/40">Min</label>
          <Input name="minPrice" defaultValue={values.minPrice} className="mt-2" inputMode="numeric" />
        </div>
        <div>
          <label className="text-[11px] uppercase tracking-[0.16em] text-ink/40">Max</label>
          <Input name="maxPrice" defaultValue={values.maxPrice} className="mt-2" inputMode="numeric" />
        </div>
      </div>
      <div>
        <label className="text-[11px] uppercase tracking-[0.16em] text-ink/40">Availability</label>
        <select
          name="availability"
          defaultValue={values.availability ?? "all"}
          className="mt-2 h-11 w-full rounded-xl border border-brand/15 bg-white px-3 text-sm"
        >
          <option value="all">All</option>
          <option value="in-stock">In stock</option>
          <option value="out-of-stock">Out of stock</option>
        </select>
      </div>
      <div>
        <label className="text-[11px] uppercase tracking-[0.16em] text-ink/40">Sort</label>
        <select
          name="sort"
          defaultValue={values.sort ?? "featured"}
          className="mt-2 h-11 w-full rounded-xl border border-brand/15 bg-white px-3 text-sm"
        >
          {sorts.map((sort) => (
            <option key={sort.value} value={sort.value}>
              {sort.label}
            </option>
          ))}
        </select>
      </div>
      <button type="submit" className="h-11 rounded-full bg-brand text-sm font-medium text-cream">
        Apply filters
      </button>
      <Link href={action} className="text-center text-sm text-ink/50 hover:text-brand">
        Clear
      </Link>
    </form>
  );
}
