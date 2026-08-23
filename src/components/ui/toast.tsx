"use client";

import { useToastStore } from "@/hooks/use-toast";
import { useEffect } from "react";

export function ToastViewport() {
  const toasts = useToastStore((state) => state.toasts);
  const dismiss = useToastStore((state) => state.dismiss);

  useEffect(() => {
    const timers = toasts.map((toast) => setTimeout(() => dismiss(toast.id), 2800));
    return () => timers.forEach(clearTimeout);
  }, [dismiss, toasts]);

  if (!toasts.length) return null;

  return (
    <div className="pointer-events-none fixed bottom-5 right-5 z-50 flex w-[min(90vw,360px)] flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto rounded-2xl border border-brand/10 bg-white px-4 py-3 shadow-xl shadow-brand/10"
        >
          <p className="text-sm font-medium text-brand">{toast.title}</p>
          {toast.description ? <p className="mt-1 text-xs text-ink/60">{toast.description}</p> : null}
        </div>
      ))}
    </div>
  );
}
