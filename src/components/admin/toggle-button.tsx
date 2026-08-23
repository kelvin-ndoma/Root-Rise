"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { adminRequest } from "@/lib/utils/admin-client";

export function ToggleButton({
  href,
  payload,
  label,
}: {
  href: string;
  payload: Record<string, unknown>;
  label: string;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  return (
    <Button
      size="sm"
      variant="outline"
      disabled={saving}
      onClick={async () => {
        setSaving(true);
        try {
          await adminRequest(href, { method: "PATCH", body: JSON.stringify(payload) });
          router.refresh();
        } finally {
          setSaving(false);
        }
      }}
    >
      {saving ? "..." : label}
    </Button>
  );
}
