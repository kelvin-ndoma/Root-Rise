import { createHash, randomBytes } from "crypto";

export function generateToken() {
  const token = randomBytes(32).toString("hex");
  const hash = hashToken(token);
  return { token, hash };
}

export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}
