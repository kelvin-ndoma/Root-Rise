"use client";

import { useState } from "react";
import { TextField } from "@/components/forms/field";
import { Button } from "@/components/ui/button";
import { adminRequest } from "@/lib/utils/admin-client";

export function ImageField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (url: string, publicId?: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="space-y-2">
      <TextField label={label} value={value} onChange={(event) => onChange(event.target.value)} placeholder="https://..." />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="min-w-0 text-sm text-ink/60">
          <input
            type="file"
            accept="image/*"
            className="max-w-full text-sm"
            onChange={async (event) => {
              const file = event.target.files?.[0];
              if (!file) return;
              setUploading(true);
              setError(null);
              try {
                const form = new FormData();
                form.set("file", file);
                const uploaded = await adminRequest<{ url: string; publicId: string }>("/api/admin/uploads", {
                  method: "POST",
                  body: form,
                });
                onChange(uploaded.url, uploaded.publicId);
              } catch (err) {
                setError(err instanceof Error ? err.message : "Upload failed.");
              } finally {
                setUploading(false);
              }
            }}
          />
        </label>
        <Button type="button" variant="ghost" size="sm" disabled={uploading}>
          {uploading ? "Uploading..." : "or paste a URL"}
        </Button>
      </div>
      {error ? <p className="text-sm text-rose">{error}</p> : null}
      {value ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={value} alt="" className="h-24 w-24 rounded-2xl object-cover" />
      ) : null}
    </div>
  );
}
