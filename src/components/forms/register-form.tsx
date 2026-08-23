"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { registerSchema } from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/forms/field";
import Link from "next/link";
import { useState } from "react";
import type { z } from "zod";

type Values = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const form = useForm<Values>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", phone: "", password: "", confirmPassword: "" },
  });

  return (
    <form
      className="space-y-5"
      onSubmit={form.handleSubmit(async (values) => {
        setError(null);
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });
        const data = (await response.json()) as { error?: string };
        if (!response.ok) {
          setError(data.error ?? "Could not create your account.");
          return;
        }
        const result = await signIn("credentials", {
          email: values.email,
          password: values.password,
          redirect: false,
        });
        if (result?.error) {
          router.push("/login");
          return;
        }
        router.push("/account");
        router.refresh();
      })}
    >
      <TextField
        label="Full name"
        autoComplete="name"
        placeholder="Wanjiku Mwangi"
        error={form.formState.errors.name?.message}
        {...form.register("name")}
      />
      <TextField
        label="Email"
        type="email"
        autoComplete="email"
        placeholder="you@email.com"
        error={form.formState.errors.email?.message}
        {...form.register("email")}
      />
      <TextField
        label="Phone"
        type="tel"
        autoComplete="tel"
        placeholder="Optional"
        error={form.formState.errors.phone?.message}
        {...form.register("phone")}
      />
      <TextField
        label="Password"
        type="password"
        autoComplete="new-password"
        placeholder="At least 8 characters"
        error={form.formState.errors.password?.message}
        {...form.register("password")}
      />
      <TextField
        label="Confirm password"
        type="password"
        autoComplete="new-password"
        placeholder="Repeat your password"
        error={form.formState.errors.confirmPassword?.message}
        {...form.register("confirmPassword")}
      />
      {error ? <p className="text-sm text-rose">{error}</p> : null}
      <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? "Creating account..." : "Create account"}
      </Button>
      <p className="text-center text-sm text-ink/55">
        Already have an account?{" "}
        <Link href="/login" className="text-brand hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
