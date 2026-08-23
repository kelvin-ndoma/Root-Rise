import { cn } from "@/lib/utils/cn";
import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes, ReactNode } from "react";
import { Input } from "@/components/ui/input";

export function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="block min-w-0">
      <span className="mb-2 block text-sm text-ink/70">{label}</span>
      {children}
      {error ? <p className="mt-1.5 text-sm text-rose">{error}</p> : null}
    </div>
  );
}

export function TextField({
  label,
  error,
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string }) {
  return (
    <Field label={label} error={error}>
      <Input className={cn(error && "border-rose/40 focus:ring-rose/20", className)} {...props} />
    </Field>
  );
}

const controlClass =
  "h-11 w-full min-w-0 rounded-xl border border-brand/15 bg-white px-4 text-sm text-ink placeholder:text-ink/40 shadow-sm transition focus:border-brand/40 focus:outline-none focus:ring-2 focus:ring-brand/15";

export function SelectField({
  label,
  error,
  className,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & { label: string; error?: string; children: ReactNode }) {
  return (
    <Field label={label} error={error}>
      <select className={cn(controlClass, error && "border-rose/40 focus:ring-rose/20", className)} {...props}>
        {children}
      </select>
    </Field>
  );
}

export function TextareaField({
  label,
  error,
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; error?: string }) {
  return (
    <Field label={label} error={error}>
      <textarea
        className={cn(
          "min-h-28 w-full min-w-0 rounded-xl border border-brand/15 bg-white px-4 py-3 text-sm text-ink placeholder:text-ink/40 shadow-sm transition focus:border-brand/40 focus:outline-none focus:ring-2 focus:ring-brand/15",
          error && "border-rose/40 focus:ring-rose/20",
          className,
        )}
        {...props}
      />
    </Field>
  );
}
