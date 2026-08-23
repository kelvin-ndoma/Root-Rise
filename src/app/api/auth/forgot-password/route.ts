import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { User } from "@/models/User";
import { forgotPasswordSchema } from "@/lib/validations/auth";
import { generateToken } from "@/lib/auth/tokens";
import { clientKey, rateLimit } from "@/lib/security/rate-limit";
import { handleRouteError, jsonOk } from "@/lib/utils/api";

export async function POST(request: NextRequest) {
  try {
    const limited = rateLimit(clientKey(request, "forgot"), { limit: 5, windowMs: 10 * 60 * 1000 });
    if (!limited.success) {
      return jsonOk({ ok: true });
    }

    const { email } = forgotPasswordSchema.parse(await request.json());
    await connectDB();
    const user = await User.findOne({ email });
    if (user) {
      const { token, hash } = generateToken();
      await User.updateOne(
        { _id: user._id },
        {
          passwordResetTokenHash: hash,
          passwordResetExpires: new Date(Date.now() + 1000 * 60 * 30),
        },
      );

      if (process.env.NODE_ENV !== "production") {
        console.info(`Password reset link: ${process.env.AUTH_URL ?? "http://localhost:3000"}/reset-password?token=${token}`);
      }
    }

    return jsonOk({ ok: true });
  } catch (error) {
    return handleRouteError(error);
  }
}
