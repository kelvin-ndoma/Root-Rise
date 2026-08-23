"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SelectField, TextareaField, TextField } from "@/components/forms/field";
import { ImageField } from "@/components/admin/image-field";
import { adminRequest } from "@/lib/utils/admin-client";
import type { SerializedCategory } from "@/types";

export function CategoryForm({
  categories,
  category,
}: {
  categories: SerializedCategory[];
  category?: SerializedCategory;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState(category?.image?.url ?? "");

  return (
    <form
      className="grid gap-5 rounded-3xl bg-white p-4 sm:p-6 md:grid-cols-2"
      onSubmit={async (event) => {
        event.preventDefault();
        setSaving(true);
        setError(null);
        const form = new FormData(event.currentTarget);
        const payload = {
          name: String(form.get("name") ?? ""),
          description: String(form.get("description") ?? ""),
          parentId: String(form.get("parentId") ?? "") || undefined,
          sortOrder: Number(form.get("sortOrder") ?? 0),
          isActive: form.get("isActive") === "on",
          image: imageUrl ? { url: imageUrl, alt: String(form.get("name") ?? "") } : undefined,
        };
        try {
          if (category) {
            await adminRequest(`/api/admin/categories/${category.id}`, {
              method: "PATCH",
              body: JSON.stringify(payload),
            });
          } else {
            await adminRequest("/api/admin/categories", {
              method: "POST",
              body: JSON.stringify(payload),
            });
          }
          router.push("/admin/categories");
          router.refresh();
        } catch (err) {
          setError(err instanceof Error ? err.message : "Could not save category.");
        } finally {
          setSaving(false);
        }
      }}
    >
      <TextField name="name" label="Name" defaultValue={category?.name} required />
      <TextField name="sortOrder" label="Sort order" type="number" defaultValue={category?.sortOrder ?? 0} />
      <div className="md:col-span-2">
        <TextareaField name="description" label="Description" defaultValue={category?.description ?? ""} />
      </div>
      <SelectField name="parentId" label="Parent category" defaultValue={category?.parentId ?? ""}>
        <option value="">None</option>
        {categories
          .filter((item) => item.id !== category?.id)
          .map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
      </SelectField>
      <label className="flex items-center gap-2 self-end text-sm">
        <input type="checkbox" name="isActive" defaultChecked={category?.isActive !== false} />
        Active
      </label>
      <div className="md:col-span-2">
        <ImageField label="Image" value={imageUrl} onChange={setImageUrl} />
      </div>
      {error ? <p className="md:col-span-2 text-sm text-rose">{error}</p> : null}
      <div>
        <Button type="submit" disabled={saving}>
          {saving ? "Saving..." : category ? "Update category" : "Create category"}
        </Button>
      </div>
    </form>
  );
}
