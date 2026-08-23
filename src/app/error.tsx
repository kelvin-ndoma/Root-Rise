"use client";

import { ErrorState } from "@/components/ui/error-state";

export default function ErrorPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-24">
      <ErrorState
        title="Something went wrong"
        description="Please refresh the page or return to the shop. If the problem continues, contact Root and Rise support."
      />
    </div>
  );
}
