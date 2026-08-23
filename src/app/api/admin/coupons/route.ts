import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth/permissions";
import { createAdminCoupon, listAdminCoupons } from "@/lib/services/admin.service";
import { couponWriteSchema } from "@/lib/validations/admin";
import { handleRouteError, jsonOk } from "@/lib/utils/api";

export async function GET() {
  try {
    await requireAdmin();
    return jsonOk(await listAdminCoupons());
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const body = couponWriteSchema.parse(await request.json());
    return jsonOk(await createAdminCoupon(body), 201);
  } catch (error) {
    return handleRouteError(error);
  }
}
