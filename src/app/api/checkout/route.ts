import { NextRequest } from "next/server";
import { checkoutSchema } from "@/lib/validations/checkout";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { placeOrder } from "@/lib/services/checkout.service";
import { clearUserCart } from "@/lib/services/cart.service";
import { handleRouteError, jsonError, jsonOk } from "@/lib/utils/api";
import { clientKey, rateLimit } from "@/lib/security/rate-limit";

const payloadSchema = checkoutSchema.extend({
  items: z.array(
    z.object({
      productId: z.string(),
      variantId: z.string().optional(),
      slug: z.string(),
      name: z.string(),
      image: z.string().optional(),
      variantLabel: z.string().optional(),
      unitPrice: z.number(),
      quantity: z.number().int().min(1),
      maxQuantity: z.number(),
    }),
  ),
});

export async function POST(request: NextRequest) {
  try {
    const limited = rateLimit(clientKey(request, "checkout"), { limit: 10, windowMs: 10 * 60 * 1000 });
    if (!limited.success) return jsonError("Too many checkout attempts. Please wait and try again.", 429);

    const session = await auth();
    const body = payloadSchema.parse(await request.json());
    const result = await placeOrder({ ...body, userId: session?.user?.id });
    if (session?.user?.id) {
      await clearUserCart(session.user.id);
    }
    return jsonOk(result, 201);
  } catch (error) {
    if (error instanceof Error && !("issues" in error)) {
      return jsonError(error.message, 400);
    }
    return handleRouteError(error);
  }
}
