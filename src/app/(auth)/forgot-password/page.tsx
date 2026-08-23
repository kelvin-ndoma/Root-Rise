"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/forms/field";

export default function ForgotPasswordPage() {
  const [message, setMessage] = useState<string | null>(null);

  return (
    <div>
      <p className="text-[11px] uppercase tracking-[0.22em] text-accent">Account</p>
      <h1 className="mt-2 font-display text-4xl text-brand">Reset password</h1>
      <p className="mt-2 text-sm text-ink/55">
        Enter your email and we will send a reset link if the account exists.
      </p>
      <form
        className="mt-8 space-y-5"
        onSubmit={async (event) => {
          event.preventDefault();
          const form = new FormData(event.currentTarget);
          const response = await fetch("/api/auth/forgot-password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: form.get("email") }),
          });
          setMessage(
            response.ok
              ? "If that email exists, we have sent password reset instructions."
              : "Please try again in a moment.",
          );
        }}
      >
        <TextField label="Email" name="email" type="email" required placeholder="you@email.com" />
        <Button type="submit" className="w-full">
          Send reset link
        </Button>
        {message ? <p className="text-sm text-ink/60">{message}</p> : null}
        <p className="text-center text-sm text-ink/55">
          <Link href="/login" className="text-brand hover:underline">
            Back to sign in
          </Link>
        </p>
      </form>
    </div>
  );
}
