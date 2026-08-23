import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/components/forms/login-form";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-[0.22em] text-accent">Account</p>
      <h1 className="mt-2 font-display text-4xl text-brand">Welcome back</h1>
      <p className="mt-2 text-sm text-ink/55">Sign in to your Root and Rise account.</p>
      <div className="mt-8">
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
