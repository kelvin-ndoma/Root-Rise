"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { adminRequest } from "@/lib/utils/admin-client";

export function ReviewDeleteButton({ id }: { id: string }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  return (
    <Button
      size="sm"
      variant="ghost"
      disabled={saving}
      onClick={async () => {
        setSaving(true);
        try {
          await adminRequest(`/api/admin/reviews/${id}`, { method: "DELETE" });
          router.refresh();
        } finally {
          setSaving(false);
        }
      }}
    >
      {saving ? "..." : "Delete"}
    </Button>
  );
}
