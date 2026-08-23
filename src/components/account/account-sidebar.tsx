"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  Heart,
  Home,
  LogOut,
  MapPin,
  Settings,
  ShoppingBag,
  Store,
  Shield,
  X,
} from "lucide-react";
import { BrandMark } from "@/components/store/brand-mark";
import { cn } from "@/lib/utils/cn";

const links = [
  { href: "/account", label: "Overview", icon: Home },
  { href: "/account/orders", label: "Orders", icon: ShoppingBag },
  { href: "/account/wishlist", label: "Wishlist", icon: Heart },
  { href: "/account/addresses", label: "Addresses", icon: MapPin },
  { href: "/account/settings", label: "Settings", icon: Settings },
];

function SidebarBody({
  onNavigate,
  userName,
  userEmail,
  userRole,
  showClose,
}: {
  onNavigate: () => void;
  userName?: string | null;
  userEmail?: string | null;
  userRole?: string | null;
  showClose?: boolean;
}) {
  const pathname = usePathname();
  const staff = userRole === "ADMIN" || userRole === "STAFF";

  return (
    <>
      <div className="flex items-center justify-between gap-2 px-5 py-6">
        <Link href="/account" onClick={onNavigate} className="min-w-0">
          <BrandMark inverted />
        </Link>
        {showClose ? (
          <button className="shrink-0 rounded-full p-2 hover:bg-white/10" onClick={onNavigate} aria-label="Close menu">
            <X size={18} />
          </button>
        ) : null}
      </div>
      <nav className="flex-1 space-y-1 px-3">
        {links.map((link) => {
          const active =
            pathname === link.href || (link.href !== "/account" && pathname.startsWith(link.href));
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm transition",
                active ? "bg-white/12 text-cream" : "text-cream/70 hover:bg-white/8 hover:text-cream",
              )}
            >
              <link.icon size={18} />
              {link.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-cream/10 p-4">
        <p className="truncate text-sm font-medium">{userName}</p>
        <p className="truncate text-xs text-cream/55">{userEmail}</p>
        <div className="mt-4 flex flex-col gap-1">
          {staff ? (
            <Link
              href="/admin"
              onClick={onNavigate}
              className="flex items-center gap-3 rounded-2xl px-3 py-2 text-sm text-cream/75 hover:bg-white/8"
            >
              <Shield size={16} />
              Admin
            </Link>
          ) : null}
          <Link
            href="/shop"
            onClick={onNavigate}
            className="flex items-center gap-3 rounded-2xl px-3 py-2 text-sm text-cream/75 hover:bg-white/8"
          >
            <Store size={16} />
            Continue shopping
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex items-center gap-3 rounded-2xl px-3 py-2 text-left text-sm text-cream/75 hover:bg-white/8"
          >
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </div>
    </>
  );
}

export function AccountSidebar({
  open,
  onClose,
  userName,
  userEmail,
  userRole,
}: {
  open: boolean;
  onClose: () => void;
  userName?: string | null;
  userEmail?: string | null;
  userRole?: string | null;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const mobileMenu =
    mounted &&
    createPortal(
      <div className={cn("fixed inset-0 z-[80] lg:hidden", open ? "visible" : "invisible pointer-events-none")}>
        <div
          className={cn("absolute inset-0 bg-ink/50 transition-opacity", open ? "opacity-100" : "opacity-0")}
          onClick={onClose}
        />
        <aside
          className={cn(
            "absolute inset-y-0 left-0 flex h-dvh w-[min(18rem,88vw)] flex-col overflow-y-auto bg-[#5c3d2e] text-cream shadow-[8px_0_40px_rgba(31,24,18,0.28)] transition-transform duration-300",
            open ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <SidebarBody
            onNavigate={onClose}
            userName={userName}
            userEmail={userEmail}
            userRole={userRole}
            showClose
          />
        </aside>
      </div>,
      document.body,
    );

  return (
    <>
      <aside className="sticky top-0 hidden h-svh w-72 shrink-0 flex-col overflow-y-auto bg-[#5c3d2e] text-cream lg:flex">
        <SidebarBody onNavigate={onClose} userName={userName} userEmail={userEmail} userRole={userRole} />
      </aside>
      {mobileMenu}
    </>
  );
}
