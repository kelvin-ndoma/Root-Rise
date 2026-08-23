import Link from "next/link";
import { ArrowRight, Award, HeartHandshake, ShieldCheck, Truck } from "lucide-react";
import { CategoryCard } from "@/components/store/category-card";
import { ProductGrid } from "@/components/store/product-grid";
import { SafeImage } from "@/components/ui/safe-image";
import { getFeaturedCategories } from "@/lib/services/category.service";
import { getBestSellers, getNewArrivals } from "@/lib/services/product.service";
import { media } from "@/config/media";

export const dynamic = "force-dynamic";

const benefits = [
  {
    title: "Quality products",
    text: "Professional-grade ingredients, decorations, and tools chosen for consistent results.",
    icon: Award,
  },
  {
    title: "Fast delivery",
    text: "Reliable fulfilment across Kenya so you can bake on time, every time.",
    icon: Truck,
  },
  {
    title: "Secure payments",
    text: "Checkout is built so orders stay unpaid until a provider confirms the transaction.",
    icon: ShieldCheck,
  },
  {
    title: "Reliable support",
    text: "Help with product selection, orders, and restocks from a team that understands baking.",
    icon: HeartHandshake,
  },
];

export default async function HomePage() {
  let categories: Awaited<ReturnType<typeof getFeaturedCategories>> = [];
  let bestSellers: Awaited<ReturnType<typeof getBestSellers>> = [];
  let newArrivals: Awaited<ReturnType<typeof getNewArrivals>> = [];
  let catalogError: string | null = null;
  try {
    [categories, bestSellers, newArrivals] = await Promise.all([
      getFeaturedCategories(6),
      getBestSellers(8),
      getNewArrivals(8),
    ]);
  } catch (error) {
    catalogError =
      error instanceof Error && error.message.includes("MONGODB_URI is not configured")
        ? "The live site has no MONGODB_URI. Add it in Vercel Production environment variables."
        : "The live site cannot reach MongoDB. Allow 0.0.0.0/0 in Atlas Network Access and use the same MONGODB_URI you seed locally.";
  }

  return (
    <div>
      {catalogError ? (
        <div className="border-b border-rose/20 bg-rose/10 px-6 py-3 text-center text-sm text-brand">
          {catalogError} Check <code className="rounded bg-white/80 px-1.5 py-0.5">/api/health</code> on this domain.
        </div>
      ) : null}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <SafeImage
            src={media.hero}
            alt="Celebration cake with chocolate ganache"
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-[linear-gradient(105deg,rgba(31,24,18,0.88)_0%,rgba(92,61,46,0.62)_48%,rgba(31,24,18,0.18)_100%)]" />
        </div>
        <div className="relative mx-auto grid min-h-[86vh] max-w-7xl items-center gap-10 px-6 py-20 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="max-w-xl text-cream">
            <p className="text-[11px] uppercase tracking-[0.32em] text-accent">Cake ingredients & confectionery supplies</p>
            <h1 className="mt-5 font-display text-5xl leading-[0.95] md:text-7xl">
              Create something
              <span className="block italic text-accent">delicious.</span>
            </h1>
            <p className="mt-6 max-w-md text-base leading-7 text-cream/80">
              Fondant, flavours, chocolates, packaging, and professional baking tools — curated for cake makers who care about finish.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                href="/shop"
                className="inline-flex h-12 items-center rounded-full bg-cream px-7 text-sm font-medium text-brand transition hover:-translate-y-0.5"
              >
                Shop now
              </Link>
              <Link
                href="#categories"
                className="inline-flex h-12 items-center gap-2 rounded-full border border-cream/25 px-7 text-sm text-cream transition hover:border-cream/60"
              >
                Explore categories
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
          <div className="hidden justify-end lg:flex">
            <div className="relative h-[520px] w-[420px] overflow-hidden rounded-[2rem] border border-cream/15 shadow-2xl">
              <SafeImage
                src={media.heroSecondary}
                alt="Decorated cupcakes"
                fill
                className="object-cover"
                sizes="420px"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-brand/10 bg-white/70">
        <div className="mx-auto grid max-w-7xl gap-6 px-6 py-6 sm:grid-cols-3">
          {["Nairobi & Kiambu delivery from KES 250", "Trade-ready ingredients", "Secure checkout, confirmed payments"].map(
            (item) => (
              <p key={item} className="text-center text-sm text-ink/65">
                {item}
              </p>
            ),
          )}
        </div>
      </section>

      <section id="categories" className="mx-auto max-w-7xl px-6 py-20">
        <div className="mb-10 flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-accent">Collections</p>
            <h2 className="mt-2 font-display text-4xl text-brand md:text-5xl">Shop by category</h2>
          </div>
          <Link href="/shop" className="hidden items-center gap-2 text-sm text-ink/60 hover:text-brand md:inline-flex">
            View all <ArrowRight size={15} />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {categories.map((category, index) => (
            <div key={category.id} className={index < 2 ? "lg:col-span-2" : undefined}>
              <CategoryCard category={category} featured={index < 2} />
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white/60 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.22em] text-accent">Most loved</p>
              <h2 className="mt-2 font-display text-4xl text-brand md:text-5xl">Best sellers</h2>
            </div>
            <Link href="/shop?sort=best-selling" className="text-sm text-ink/60 hover:text-brand">
              Shop bestsellers
            </Link>
          </div>
          <div className="mt-10">
            <ProductGrid products={bestSellers} />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-8">
        <div className="relative min-h-80 overflow-hidden rounded-[2rem]">
          <SafeImage src={media.banner} alt="Decorated cupcakes" fill className="object-cover" sizes="100vw" />
          <div className="absolute inset-0 bg-brand/70" />
          <div className="relative flex min-h-80 flex-col items-center justify-center px-8 text-center text-cream">
            <p className="text-[11px] uppercase tracking-[0.28em] text-accent">Root and Rise</p>
            <h2 className="mt-4 max-w-3xl font-display text-4xl md:text-6xl">
              Everything you need to create something delicious.
            </h2>
            <Link href="/shop" className="mt-8 inline-flex h-12 items-center rounded-full bg-cream px-7 text-sm font-medium text-brand">
              Browse the shop
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-accent">Just in</p>
            <h2 className="mt-2 font-display text-4xl text-brand md:text-5xl">New arrivals</h2>
          </div>
          <Link href="/shop?sort=newest" className="text-sm text-ink/60 hover:text-brand">
            See what&apos;s new
          </Link>
        </div>
        <div className="mt-10">
          <ProductGrid products={newArrivals} />
        </div>
      </section>

      <section className="bg-brand py-20 text-cream">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="font-display text-4xl md:text-5xl">Why shop with Root and Rise</h2>
          <div className="mt-10 grid gap-4 md:grid-cols-4">
            {benefits.map((benefit) => (
              <div key={benefit.title} className="rounded-3xl border border-cream/10 bg-white/5 p-6">
                <benefit.icon className="text-accent" />
                <h3 className="mt-5 font-medium">{benefit.title}</h3>
                <p className="mt-2 text-sm leading-6 text-cream/70">{benefit.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-24 text-center">
        <p className="text-[11px] uppercase tracking-[0.22em] text-accent">Ready when you are</p>
        <h2 className="mt-3 font-display text-5xl text-brand md:text-6xl">Bake beautifully.</h2>
        <p className="mx-auto mt-4 max-w-xl text-ink/60">
          From fondant and flavouring to cake boards and piping tips, Root and Rise is built for confectioners who want a polished finish.
        </p>
        <Link
          href="/shop"
          className="mt-8 inline-flex h-12 items-center rounded-full bg-brand px-8 text-sm font-medium text-cream transition hover:-translate-y-0.5"
        >
          Start shopping
        </Link>
      </section>
    </div>
  );
}
