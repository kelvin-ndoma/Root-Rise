import { cn } from "@/lib/utils/cn";
import type { InputHTMLAttributes } from "react";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-11 w-full min-w-0 rounded-xl border border-brand/15 bg-white px-4 text-sm text-ink placeholder:text-ink/40 shadow-sm transition focus:border-brand/40 focus:outline-none focus:ring-2 focus:ring-brand/15",
        className,
      )}
      {...props}
    />
  );
}
