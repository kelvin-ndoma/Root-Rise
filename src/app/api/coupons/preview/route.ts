import { NextRequest } from "next/server";
import { couponCodeSchema } from "@/lib/validations/checkout";
import { z } from "zod";
import { previewCoupon } from "@/lib/services/coupon.service";
import { handleRouteError, jsonError, jsonOk } from "@/lib/utils/api";

const schema = couponCodeSchema.extend({
  subtotal: z.coerce.number().min(0),
});

export async function POST(request: NextRequest) {
  try {
    const body = schema.parse(await request.json());
    const preview = await previewCoupon(body.code, body.subtotal);
    return jsonOk(preview);
  } catch (error) {
    if (error instanceof Error && !("issues" in error)) {
      return jsonError(error.message, 400);
    }
    return handleRouteError(error);
  }
}
