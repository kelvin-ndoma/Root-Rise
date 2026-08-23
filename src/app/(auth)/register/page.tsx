import type { Metadata } from "next";
import { RegisterForm } from "@/components/forms/register-form";

export const metadata: Metadata = { title: "Create account" };

export default function RegisterPage() {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-[0.22em] text-accent">Account</p>
      <h1 className="mt-2 font-display text-4xl text-brand">Create an account</h1>
      <p className="mt-2 text-sm text-ink/55">Save your cart, track orders, and checkout faster.</p>
      <div className="mt-8">
        <RegisterForm />
      </div>
    </div>
  );
}
