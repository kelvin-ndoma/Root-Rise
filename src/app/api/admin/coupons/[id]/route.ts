import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth/permissions";
import { updateAdminCoupon } from "@/lib/services/admin.service";
import { couponUpdateSchema } from "@/lib/validations/admin";
import { handleRouteError, jsonOk } from "@/lib/utils/api";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = couponUpdateSchema.parse(await request.json());
    return jsonOk(await updateAdminCoupon(id, body));
  } catch (error) {
    return handleRouteError(error);
  }
}
