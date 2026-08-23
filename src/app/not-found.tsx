import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
      <p className="text-xs uppercase tracking-[0.2em] text-accent">404</p>
      <h1 className="mt-3 font-display text-5xl text-brand">We could not find that page</h1>
      <p className="mt-4 max-w-md text-ink/60">The page may have moved, or the product is no longer available.</p>
      <Link href="/shop" className="mt-8 inline-flex h-12 items-center rounded-full bg-brand px-6 text-sm text-cream">
        Continue shopping
      </Link>
    </div>
  );
}
