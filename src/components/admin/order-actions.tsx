"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SelectField, TextareaField } from "@/components/forms/field";
import { adminRequest } from "@/lib/utils/admin-client";
import { ORDER_STATUSES } from "@/types";

export function OrderActions({
  orderId,
  status,
  paymentStatus,
  internalNotes,
}: {
  orderId: string;
  status: string;
  paymentStatus: string;
  internalNotes?: string;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save(payload: Record<string, unknown>) {
    setSaving(true);
    setError(null);
    try {
      await adminRequest(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update order.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5 rounded-3xl bg-white p-4 sm:p-6">
      <form
        className="space-y-4"
        onSubmit={async (event) => {
          event.preventDefault();
          const form = new FormData(event.currentTarget);
          await save({
            status: form.get("status"),
            internalNotes: form.get("internalNotes"),
            note: form.get("note"),
          });
        }}
      >
        <SelectField name="status" label="Order status" defaultValue={status}>
          {ORDER_STATUSES.map((item) => (
            <option key={item} value={item}>
              {item.replaceAll("_", " ")}
            </option>
          ))}
        </SelectField>
        <TextareaField name="internalNotes" label="Internal notes" defaultValue={internalNotes ?? ""} />
        <TextareaField name="note" label="Timeline note" placeholder="Optional note for the customer timeline" />
        {error ? <p className="text-sm text-rose">{error}</p> : null}
        <Button type="submit" className="w-full sm:w-auto" disabled={saving}>
          {saving ? "Saving..." : "Update order"}
        </Button>
      </form>
      <div className="flex flex-wrap gap-2">
        {paymentStatus !== "PAID" ? (
          <Button variant="secondary" disabled={saving} onClick={() => save({ paymentStatus: "PAID" })}>
            Confirm payment
          </Button>
        ) : null}
        {status !== "CANCELLED" ? (
          <Button variant="outline" disabled={saving} onClick={() => save({ status: "CANCELLED", note: "Cancelled by admin" })}>
            Cancel and restock
          </Button>
        ) : null}
      </div>
    </div>
  );
}
