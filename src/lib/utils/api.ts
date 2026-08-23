import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { AuthError } from "@/lib/auth/permissions";

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function jsonOk<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export function handleRouteError(error: unknown) {
  if (error instanceof AuthError) {
    return jsonError(error.message, error.status);
  }

  if (error instanceof ZodError) {
    return jsonError(error.issues[0]?.message ?? "Invalid request", 422);
  }

  if (error instanceof Error && error.name === "MongoServerError" && "code" in error && error.code === 11000) {
    return jsonError("That value is already in use.", 409);
  }

  if (error instanceof Error && !("issues" in error)) {
    const known = [
      "not found",
      "enough stock",
      "already",
      "cannot",
      "required",
      "invalid",
    ];
    if (known.some((word) => error.message.toLowerCase().includes(word))) {
      return jsonError(error.message, 400);
    }
  }

  console.error(error);
  return jsonError("Something went wrong. Please try again.", 500);
}
