import Link from "next/link";
import { siteConfig } from "@/config/site";
import type { SerializedCategory } from "@/types";
import { BrandMark } from "@/components/store/brand-mark";

export function Footer({ categories }: { categories: SerializedCategory[] }) {
  return (
    <footer className="mt-auto bg-brand text-cream">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 md:grid-cols-4">
        <div>
          <BrandMark inverted />
          <p className="mt-5 max-w-xs text-sm leading-7 text-cream/70">{siteConfig.description}</p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-accent">Shop</p>
          <div className="mt-5 flex flex-col gap-2.5 text-sm text-cream/80">
            <Link href="/shop" className="hover:text-cream">
              All products
            </Link>
            {categories.slice(0, 6).map((category) => (
              <Link key={category.id} href={`/categories/${category.slug}`} className="hover:text-cream">
                {category.name}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-accent">Help</p>
          <div className="mt-5 flex flex-col gap-2.5 text-sm text-cream/80">
            <Link href="/account/orders" className="hover:text-cream">
              Track an order
            </Link>
            <Link href="/account" className="hover:text-cream">
              Your account
            </Link>
            <a href={`mailto:${siteConfig.supportEmail}`} className="hover:text-cream">
              {siteConfig.supportEmail}
            </a>
          </div>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-accent">Visit</p>
          <p className="mt-5 text-sm leading-7 text-cream/80">
            Nairobi, Kenya
            <br />
            {siteConfig.supportPhone}
          </p>
        </div>
      </div>
      <div className="border-t border-cream/10 px-6 py-5 text-center text-xs text-cream/45">
        © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
      </div>
    </footer>
  );
}
