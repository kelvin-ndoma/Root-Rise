"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SelectField, TextareaField, TextField } from "@/components/forms/field";
import { ImageField } from "@/components/admin/image-field";
import { adminRequest } from "@/lib/utils/admin-client";
import type { SerializedCategory, SerializedProduct } from "@/types";

export function ProductForm({
  categories,
  product,
}: {
  categories: SerializedCategory[];
  product?: SerializedProduct;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [imageUrl, setImageUrl] = useState(product?.images[0]?.url ?? "");
  const [publicId, setPublicId] = useState(product?.images[0]?.publicId);

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
          sku: String(form.get("sku") ?? ""),
          description: String(form.get("description") ?? ""),
          categoryId: String(form.get("categoryId") ?? ""),
          price: Number(form.get("price")),
          compareAtPrice: form.get("compareAtPrice") ? Number(form.get("compareAtPrice")) : undefined,
          stock: Number(form.get("stock") ?? 0),
          lowStockThreshold: Number(form.get("lowStockThreshold") ?? 5),
          images: imageUrl ? [{ url: imageUrl, publicId, alt: String(form.get("name") ?? "") }] : [],
          isActive: form.get("isActive") === "on",
          isFeatured: form.get("isFeatured") === "on",
          isBestSeller: form.get("isBestSeller") === "on",
          seoTitle: String(form.get("seoTitle") ?? ""),
          seoDescription: String(form.get("seoDescription") ?? ""),
        };
        try {
          if (product) {
            await adminRequest(`/api/admin/products/${product.id}`, {
              method: "PATCH",
              body: JSON.stringify(payload),
            });
          } else {
            await adminRequest("/api/admin/products", {
              method: "POST",
              body: JSON.stringify(payload),
            });
          }
          router.push("/admin/products");
          router.refresh();
        } catch (err) {
          setError(err instanceof Error ? err.message : "Could not save product.");
        } finally {
          setSaving(false);
        }
      }}
    >
      <TextField name="name" label="Name" defaultValue={product?.name} required />
      <TextField name="sku" label="SKU" defaultValue={product?.sku} required />
      <div className="md:col-span-2">
        <TextareaField name="description" label="Description" defaultValue={product?.description} required />
      </div>
      <SelectField name="categoryId" label="Category" defaultValue={product?.category?.id} required>
        <option value="">Choose a category</option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </SelectField>
      <TextField name="price" label="Price (KES)" type="number" min={0} step="1" defaultValue={product?.price} required />
      <TextField
        name="compareAtPrice"
        label="Compare-at price"
        type="number"
        min={0}
        step="1"
        defaultValue={product?.compareAtPrice ?? ""}
      />
      <TextField
        name="stock"
        label="Stock"
        type="number"
        min={0}
        defaultValue={product?.stock ?? 0}
        disabled={product?.hasVariants}
      />
      <TextField
        name="lowStockThreshold"
        label="Low stock threshold"
        type="number"
        min={0}
        defaultValue={product?.lowStockThreshold ?? 5}
      />
      <div className="md:col-span-2">
        <ImageField
          label="Image"
          value={imageUrl}
          onChange={(url, id) => {
            setImageUrl(url);
            setPublicId(id);
          }}
        />
      </div>
      <TextField name="seoTitle" label="SEO title" defaultValue={product?.seoTitle ?? ""} />
      <TextField name="seoDescription" label="SEO description" defaultValue={product?.seoDescription ?? ""} />
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="isActive" defaultChecked={product?.isActive !== false} />
        Published
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="isFeatured" defaultChecked={product?.isFeatured} />
        Featured
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="isBestSeller" defaultChecked={product?.isBestSeller} />
        Best seller
      </label>
      {error ? <p className="md:col-span-2 text-sm text-rose">{error}</p> : null}
      <div className="md:col-span-2">
        <Button type="submit" className="w-full sm:w-auto" disabled={saving}>
          {saving ? "Saving..." : product ? "Update product" : "Create product"}
        </Button>
      </div>
    </form>
  );
}
