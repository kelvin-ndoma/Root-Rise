"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SelectField, TextField } from "@/components/forms/field";
import { adminRequest } from "@/lib/utils/admin-client";

export function CouponForm() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      className="grid gap-4 rounded-3xl bg-white p-4 sm:p-6 md:grid-cols-2"
      onSubmit={async (event) => {
        event.preventDefault();
        setSaving(true);
        setError(null);
        const form = new FormData(event.currentTarget);
        try {
          await adminRequest("/api/admin/coupons", {
            method: "POST",
            body: JSON.stringify({
              code: form.get("code"),
              type: form.get("type"),
              value: Number(form.get("value")),
              minOrderAmount: Number(form.get("minOrderAmount") || 0),
              usageLimit: form.get("usageLimit") ? Number(form.get("usageLimit")) : undefined,
              expiresAt: form.get("expiresAt") || undefined,
              isActive: true,
            }),
          });
          event.currentTarget.reset();
          router.refresh();
        } catch (err) {
          setError(err instanceof Error ? err.message : "Could not create coupon.");
        } finally {
          setSaving(false);
        }
      }}
    >
      <TextField name="code" label="Code" placeholder="WELCOME10" required />
      <SelectField name="type" label="Type" defaultValue="PERCENTAGE">
        <option value="PERCENTAGE">Percentage</option>
        <option value="FIXED">Fixed amount</option>
      </SelectField>
      <TextField name="value" label="Value" type="number" min={0} required />
      <TextField name="minOrderAmount" label="Minimum order" type="number" min={0} defaultValue={0} />
      <TextField name="usageLimit" label="Usage limit" type="number" min={1} />
      <TextField name="expiresAt" label="Expires" type="date" />
      {error ? <p className="md:col-span-2 text-sm text-rose">{error}</p> : null}
      <div>
        <Button type="submit" disabled={saving}>
          {saving ? "Saving..." : "Create coupon"}
        </Button>
      </div>
    </form>
  );
}
