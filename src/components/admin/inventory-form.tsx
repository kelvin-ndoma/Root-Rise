"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SelectField, TextField } from "@/components/forms/field";
import { adminRequest } from "@/lib/utils/admin-client";
import type { SerializedProduct } from "@/types";

export function InventoryForm({ products }: { products: SerializedProduct[] }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      className="grid gap-4 rounded-3xl bg-white p-4 sm:grid-cols-2 sm:p-6 xl:grid-cols-4"
      onSubmit={async (event) => {
        event.preventDefault();
        setSaving(true);
        setError(null);
        const form = new FormData(event.currentTarget);
        try {
          await adminRequest("/api/admin/inventory", {
            method: "POST",
            body: JSON.stringify({
              productId: form.get("productId"),
              quantity: Number(form.get("quantity")),
              note: form.get("note"),
            }),
          });
          event.currentTarget.reset();
          router.refresh();
        } catch (err) {
          setError(err instanceof Error ? err.message : "Could not adjust stock.");
        } finally {
          setSaving(false);
        }
      }}
    >
      <SelectField name="productId" label="Product" required>
        <option value="">Choose a product</option>
        {products.map((product) => (
          <option key={product.id} value={product.id}>
            {product.name} · {product.stock} in stock
          </option>
        ))}
      </SelectField>
      <TextField name="quantity" label="Quantity change" type="number" required placeholder="+10 or -2" />
      <TextField name="note" label="Note" placeholder="Restock from supplier" />
      <div className="sm:self-end">
        <Button type="submit" className="w-full xl:w-auto" disabled={saving}>
          {saving ? "Saving..." : "Adjust stock"}
        </Button>
      </div>
      {error ? <p className="md:col-span-4 text-sm text-rose">{error}</p> : null}
    </form>
  );
}
