import { NextRequest } from "next/server";
import { z } from "zod";
import { requireUser, AuthError } from "@/lib/auth/permissions";
import { cartMutationSchema, cartUpdateSchema } from "@/lib/validations/checkout";
import { getUserCart, mergeGuestCart, setCartLine } from "@/lib/services/cart.service";
import { handleRouteError, jsonError, jsonOk } from "@/lib/utils/api";
import type { CartLine } from "@/types";

function authError(error: unknown) {
  if (error instanceof AuthError) return jsonError(error.message, error.status);
  return null;
}

export async function GET() {
  try {
    const user = await requireUser();
    return jsonOk({ items: await getUserCart(user.id) });
  } catch (error) {
    return authError(error) ?? handleRouteError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser();
    const body = cartMutationSchema.parse(await request.json());
    const current = await getUserCart(user.id);
    const existing = current.find(
      (item) => item.productId === body.productId && item.variantId === body.variantId,
    );
    const items = await setCartLine(user.id, {
      ...body,
      quantity: (existing?.quantity ?? 0) + body.quantity,
    });
    return jsonOk({ items });
  } catch (error) {
    return authError(error) ?? handleRouteError(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await requireUser();
    const body = cartUpdateSchema.parse(await request.json());
    const items = await setCartLine(user.id, body);
    return jsonOk({ items });
  } catch (error) {
    return authError(error) ?? handleRouteError(error);
  }
}

const mergeSchema = z.object({
  items: z.array(
    z.object({
      productId: z.string(),
      variantId: z.string().optional(),
      quantity: z.number().int().min(1),
      slug: z.string(),
      name: z.string(),
      image: z.string().optional(),
      variantLabel: z.string().optional(),
      unitPrice: z.number(),
      maxQuantity: z.number(),
    }),
  ),
});

export async function PUT(request: NextRequest) {
  try {
    const user = await requireUser();
    const body = mergeSchema.parse(await request.json());
    const items = await mergeGuestCart(user.id, body.items as CartLine[]);
    return jsonOk({ items });
  } catch (error) {
    return authError(error) ?? handleRouteError(error);
  }
}
