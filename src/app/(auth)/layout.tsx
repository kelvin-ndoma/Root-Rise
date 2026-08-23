import Link from "next/link";
import { BrandMark } from "@/components/store/brand-mark";
import { SafeImage } from "@/components/ui/safe-image";
import { media } from "@/config/media";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-svh bg-cream lg:grid-cols-2">
      <aside className="relative hidden overflow-hidden lg:block">
        <SafeImage
          src={media.bakery}
          alt="Bakery counter with cakes and confectionery"
          fill
          priority
          className="object-cover"
          sizes="50vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand via-brand/50 to-brand/20" />
        <div className="absolute inset-x-0 bottom-0 p-12 text-cream">
          <BrandMark inverted />
          <p className="mt-6 max-w-sm font-display text-4xl leading-tight">
            Everything you need to create something delicious.
          </p>
          <p className="mt-4 max-w-sm text-sm leading-6 text-cream/75">
            Sign in to track orders, save addresses, and keep your cart across devices.
          </p>
        </div>
      </aside>

      <div className="flex flex-col">
        <header className="flex items-center justify-between px-6 py-5">
          <Link href="/" className="lg:hidden">
            <BrandMark />
          </Link>
          <Link href="/shop" className="ml-auto text-sm text-ink/55 transition hover:text-brand">
            Continue shopping
          </Link>
        </header>
        <main className="flex flex-1 items-center justify-center px-6 py-10">
          <div className="w-full max-w-[400px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
