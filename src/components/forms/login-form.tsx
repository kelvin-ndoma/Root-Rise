"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { loginSchema } from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/forms/field";
import Link from "next/link";
import { useState } from "react";
import type { z } from "zod";

type Values = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const form = useForm<Values>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  return (
    <form
      className="space-y-5"
      onSubmit={form.handleSubmit(async (values) => {
        setError(null);
        const result = await signIn("credentials", {
          ...values,
          redirect: false,
        });
        if (result?.error) {
          setError("That email or password is not correct.");
          return;
        }
        const callbackUrl = searchParams.get("callbackUrl");
        if (callbackUrl) {
          router.push(callbackUrl);
          router.refresh();
          return;
        }
        const session = await fetch("/api/auth/session").then((response) => response.json());
        const role = session?.user?.role;
        router.push(role === "ADMIN" || role === "STAFF" ? "/admin" : "/account");
        router.refresh();
      })}
    >
      <TextField
        label="Email"
        type="email"
        autoComplete="email"
        placeholder="you@email.com"
        error={form.formState.errors.email?.message}
        {...form.register("email")}
      />
      <TextField
        label="Password"
        type="password"
        autoComplete="current-password"
        placeholder="Your password"
        error={form.formState.errors.password?.message}
        {...form.register("password")}
      />
      {error ? <p className="text-sm text-rose">{error}</p> : null}
      <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? "Signing in..." : "Sign in"}
      </Button>
      <div className="flex items-center justify-between text-sm">
        <Link href="/register" className="text-brand hover:underline">
          Create an account
        </Link>
        <Link href="/forgot-password" className="text-ink/50 hover:text-brand">
          Forgot password
        </Link>
      </div>
    </form>
  );
}
