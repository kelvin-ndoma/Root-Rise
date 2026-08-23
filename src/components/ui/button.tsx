import { cn } from "@/lib/utils/cn";
import type { ButtonHTMLAttributes } from "react";

const buttonStyles = {
  base: "inline-flex items-center justify-center gap-2 rounded-full font-medium tracking-wide transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:ring-offset-2",
  variants: {
    primary:
      "bg-brand text-cream shadow-sm hover:-translate-y-0.5 hover:bg-brand-dark hover:shadow-md",
    secondary:
      "bg-accent text-ink hover:-translate-y-0.5 hover:bg-[#b8945f]",
    outline:
      "border border-brand/20 bg-transparent text-brand hover:border-brand hover:bg-brand/5",
    ghost: "text-ink/80 hover:bg-brand/5 hover:text-brand",
    cream: "bg-cream text-brand hover:bg-white",
  },
  sizes: {
    sm: "h-9 px-4 text-xs",
    md: "h-11 px-6 text-sm",
    lg: "h-12 px-8 text-base",
  },
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof buttonStyles.variants;
  size?: keyof typeof buttonStyles.sizes;
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(buttonStyles.base, buttonStyles.variants[variant], buttonStyles.sizes[size], className)}
      {...props}
    />
  );
}
