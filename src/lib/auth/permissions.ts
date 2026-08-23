import { auth } from "@/lib/auth";
import type { UserRole } from "@/types";

export class AuthError extends Error {
  status: number;
  constructor(message: string, status = 401) {
    super(message);
    this.status = status;
  }
}

export async function getCurrentUser() {
  const session = await auth();
  return session?.user ?? null;
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user?.id) {
    throw new AuthError("Please sign in to continue.", 401);
  }
  return user;
}

export async function requireRole(roles: UserRole[]) {
  const user = await requireUser();
  if (!roles.includes(user.role)) {
    throw new AuthError("You do not have permission to access this resource.", 403);
  }
  return user;
}

export function requireAdmin() {
  return requireRole(["ADMIN", "STAFF"]);
}

export function requireOwnerAdmin() {
  return requireRole(["ADMIN"]);
}
