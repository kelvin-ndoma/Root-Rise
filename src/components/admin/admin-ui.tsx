import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export const adminFieldClass =
  "h-11 w-full min-w-0 rounded-xl border border-brand/15 bg-white px-3 text-sm sm:px-4";

export function AdminTable({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("overflow-x-auto rounded-3xl bg-white", className)}>
      <table className="w-full min-w-[36rem] text-left text-sm">{children}</table>
    </div>
  );
}

export function AdminPanel({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("min-w-0 rounded-3xl bg-white p-4 sm:p-6", className)}>{children}</div>;
}
