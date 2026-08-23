"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { AccountSidebar } from "@/components/account/account-sidebar";

export function AccountShell({
  userName,
  userEmail,
  userRole,
  children,
}: {
  userName?: string | null;
  userEmail?: string | null;
  userRole?: string | null;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-svh overflow-x-hidden bg-[#f3eee7] lg:flex">
      <AccountSidebar
        open={open}
        onClose={() => setOpen(false)}
        userName={userName}
        userEmail={userEmail}
        userRole={userRole}
      />
      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-40 flex items-center gap-3 border-b border-brand/10 bg-[#f3eee7]/95 px-3 py-3 backdrop-blur sm:px-4 lg:hidden">
          <button
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-brand px-3 py-2 text-sm font-medium text-cream"
            onClick={() => setOpen(true)}
          >
            <Menu size={18} />
            Menu
          </button>
          <p className="truncate font-display text-xl text-brand">Account</p>
        </header>
        <div className="min-w-0 p-3 sm:p-4 md:p-8">{children}</div>
      </div>
    </div>
  );
}
