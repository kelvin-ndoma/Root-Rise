import type { ReactNode } from "react";

export function AdminPageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow ? <p className="text-[11px] uppercase tracking-[0.22em] text-accent">{eyebrow}</p> : null}
        <h1 className="mt-1 break-words font-display text-3xl text-brand sm:text-4xl">{title}</h1>
        {description ? <p className="mt-2 max-w-xl text-sm text-ink/55">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}
