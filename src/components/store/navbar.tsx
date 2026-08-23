import type { SerializedCategory } from "@/types";
import { SearchBar } from "@/components/store/search-bar";
import { StoreHeader } from "@/components/store/store-header";

export function Navbar({ categories }: { categories: SerializedCategory[] }) {
  return (
    <header className="sticky top-0 z-40 border-b border-brand/10 bg-[#fbf7f2]/85 backdrop-blur-xl">
      <div className="bg-brand text-center text-[11px] uppercase tracking-[0.2em] text-cream/85">
        <p className="px-4 py-2">Nairobi delivery from KES 250 · Trade orders welcome</p>
      </div>
      <StoreHeader categories={categories} />
      <div className="border-t border-brand/10 px-4 py-3 md:hidden">
        <SearchBar />
      </div>
    </header>
  );
}
