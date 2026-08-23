"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Menu, ShoppingBag, UserRound, X } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { SearchBar } from "@/components/store/search-bar";
import { BrandMark } from "@/components/store/brand-mark";
import { useCartStore, cartTotals } from "@/lib/store/cart-store";
import type { SerializedCategory } from "@/types";
import { cn } from "@/lib/utils/cn";

export function StoreHeader({ categories }: { categories: SerializedCategory[] }) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { data: session } = useSession();
  const count = cartTotals(useCartStore((state) => state.items)).count;

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="mx-auto flex max-w-7xl items-center gap-5 px-4 py-3.5 md:px-6">
      <button className="rounded-full p-2 hover:bg-brand/5 lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu">
        <Menu size={20} />
      </button>
      <Link href="/" className="shrink-0">
        <BrandMark />
      </Link>
      <nav className="hidden items-center gap-7 text-sm text-ink/70 lg:flex">
        <Link href="/shop" className="transition hover:text-brand">
          Shop
        </Link>
        <div className="group relative">
          <Link href="/shop" className="transition hover:text-brand">
            Categories
          </Link>
          <div className="invisible absolute left-0 top-full z-30 mt-2 min-w-60 rounded-2xl border border-brand/10 bg-white p-2 opacity-0 shadow-xl shadow-brand/10 transition group-hover:visible group-hover:opacity-100">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/categories/${category.slug}`}
                className="block rounded-xl px-3 py-2.5 hover:bg-cream"
              >
                {category.name}
              </Link>
            ))}
          </div>
        </div>
        <Link href="/search" className="transition hover:text-brand">
          Search
        </Link>
      </nav>
      <div className="ml-auto hidden flex-1 justify-center md:flex">
        <SearchBar className="w-full max-w-md" />
      </div>
      <div className="ml-auto flex items-center gap-2 md:ml-0">
        {session?.user ? (
          <div className="hidden items-center gap-3 pr-1 text-sm md:flex">
            <Link href="/account" className="hover:text-brand">
              {session.user.name?.split(" ")[0]}
            </Link>
            {session.user.role === "ADMIN" || session.user.role === "STAFF" ? (
              <Link href="/admin" className="text-accent hover:text-brand">
                Admin
              </Link>
            ) : null}
            <button onClick={() => signOut({ callbackUrl: "/" })} className="text-ink/45 hover:text-brand">
              Sign out
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            className="hidden items-center gap-2 rounded-full px-3 py-2 text-sm text-ink/70 hover:bg-brand/5 hover:text-brand md:flex"
          >
            <UserRound size={18} />
            Sign in
          </Link>
        )}
        <Link
          href="/cart"
          className="relative grid h-11 w-11 place-items-center rounded-full bg-brand text-cream transition hover:bg-brand-dark"
        >
          <ShoppingBag size={18} />
          {count ? (
            <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-rose px-1 text-[10px] font-semibold">
              {count}
            </span>
          ) : null}
        </Link>
      </div>

      {mounted
        ? createPortal(
            <div
              className={cn(
                "fixed inset-0 z-[80] lg:hidden",
                open ? "visible" : "invisible pointer-events-none",
              )}
              onClick={() => setOpen(false)}
            >
              <div className={cn("absolute inset-0 bg-ink/50 transition-opacity", open ? "opacity-100" : "opacity-0")} />
              <aside
                className={cn(
                  "absolute inset-y-0 left-0 flex h-dvh w-[min(20rem,88vw)] flex-col overflow-y-auto bg-[#f8f3ec] p-6 shadow-[8px_0_40px_rgba(31,24,18,0.22)] transition-transform duration-300",
                  open ? "translate-x-0" : "-translate-x-full",
                )}
                onClick={(event) => event.stopPropagation()}
              >
                <div className="mb-8 flex items-center justify-between">
                  <BrandMark />
                  <button onClick={() => setOpen(false)} aria-label="Close menu" className="rounded-full p-2 hover:bg-brand/5">
                    <X />
                  </button>
                </div>
                <div className="flex flex-col gap-1 rounded-3xl bg-white p-2 text-lg">
                  <Link href="/shop" onClick={() => setOpen(false)} className="rounded-2xl px-3 py-3 hover:bg-cream">
                    Shop
                  </Link>
                  {categories.map((category) => (
                    <Link
                      key={category.id}
                      href={`/categories/${category.slug}`}
                      onClick={() => setOpen(false)}
                      className="rounded-2xl px-3 py-3 hover:bg-cream"
                    >
                      {category.name}
                    </Link>
                  ))}
                  <Link
                    href={session ? "/account" : "/login"}
                    onClick={() => setOpen(false)}
                    className="rounded-2xl px-3 py-3 hover:bg-cream"
                  >
                    {session ? "My account" : "Sign in"}
                  </Link>
                  {session?.user?.role === "ADMIN" || session?.user?.role === "STAFF" ? (
                    <Link href="/admin" onClick={() => setOpen(false)} className="rounded-2xl px-3 py-3 text-accent hover:bg-cream">
                      Admin
                    </Link>
                  ) : null}
                </div>
              </aside>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
