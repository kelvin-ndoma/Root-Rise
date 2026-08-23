"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, Suspense } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/forms/field";

function ResetPasswordForm() {
  const token = useSearchParams().get("token") ?? "";
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  return (
    <div>
      <p className="text-[11px] uppercase tracking-[0.22em] text-accent">Account</p>
      <h1 className="mt-2 font-display text-4xl text-brand">New password</h1>
      <p className="mt-2 text-sm text-ink/55">Choose a new password for your Root and Rise account.</p>
      <form
        className="mt-8 space-y-5"
        onSubmit={async (event) => {
          event.preventDefault();
          const form = new FormData(event.currentTarget);
          const response = await fetch("/api/auth/reset-password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              token,
              password: form.get("password"),
              confirmPassword: form.get("confirmPassword"),
            }),
          });
          const data = (await response.json()) as { error?: string };
          if (!response.ok) {
            setError(data.error ?? "Could not reset password.");
            return;
          }
          router.push("/login");
        }}
      >
        <TextField
          label="New password"
          name="password"
          type="password"
          required
          minLength={8}
          placeholder="At least 8 characters"
        />
        <TextField
          label="Confirm password"
          name="confirmPassword"
          type="password"
          required
          minLength={8}
          placeholder="Repeat your password"
        />
        {error ? <p className="text-sm text-rose">{error}</p> : null}
        <Button type="submit" className="w-full">
          Update password
        </Button>
        <p className="text-center text-sm text-ink/55">
          <Link href="/login" className="text-brand hover:underline">
            Back to sign in
          </Link>
        </p>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
