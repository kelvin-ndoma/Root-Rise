import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { User } from "@/models/User";
import { resetPasswordSchema } from "@/lib/validations/auth";
import { hashToken } from "@/lib/auth/tokens";
import { hashPassword } from "@/lib/auth/password";
import { handleRouteError, jsonError, jsonOk } from "@/lib/utils/api";

export async function POST(request: NextRequest) {
  try {
    const body = resetPasswordSchema.parse(await request.json());
    await connectDB();
    const user = await User.findOne({
      passwordResetTokenHash: hashToken(body.token),
      passwordResetExpires: { $gt: new Date() },
    }).select("+passwordResetTokenHash +passwordResetExpires +passwordHash");

    if (!user) {
      return jsonError("This reset link is invalid or has expired.", 400);
    }

    user.passwordHash = await hashPassword(body.password);
    user.passwordResetTokenHash = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    return jsonOk({ ok: true });
  } catch (error) {
    return handleRouteError(error);
  }
}
