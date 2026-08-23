import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { User } from "@/models/User";
import { registerSchema } from "@/lib/validations/auth";
import { hashPassword } from "@/lib/auth/password";
import { clientKey, rateLimit } from "@/lib/security/rate-limit";
import { handleRouteError, jsonError, jsonOk } from "@/lib/utils/api";

export async function POST(request: NextRequest) {
  try {
    const limited = rateLimit(clientKey(request, "register"), { limit: 8, windowMs: 10 * 60 * 1000 });
    if (!limited.success) {
      return jsonError("Too many attempts. Please try again later.", 429);
    }

    const body = registerSchema.parse(await request.json());
    await connectDB();

    const exists = await User.findOne({ email: body.email });
    if (exists) {
      return jsonError("An account with this email already exists.", 409);
    }

    await User.create({
      name: body.name,
      email: body.email,
      phone: body.phone || undefined,
      passwordHash: await hashPassword(body.password),
      role: "CUSTOMER",
    });

    return jsonOk({ ok: true }, 201);
  } catch (error) {
    return handleRouteError(error);
  }
}
