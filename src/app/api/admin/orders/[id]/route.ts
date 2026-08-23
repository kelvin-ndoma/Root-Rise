import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth/permissions";
import { getAdminOrder, updateAdminOrder } from "@/lib/services/admin.service";
import { orderUpdateSchema } from "@/lib/validations/admin";
import { handleRouteError, jsonError, jsonOk } from "@/lib/utils/api";

type Params = Promise<{ id: string }>;

export async function GET(_request: NextRequest, { params }: { params: Params }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const order = await getAdminOrder(id);
    if (!order) return jsonError("Order not found.", 404);
    return jsonOk(order);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Params }) {
  try {
    const user = await requireAdmin();
    const { id } = await params;
    const body = orderUpdateSchema.parse(await request.json());
    return jsonOk(await updateAdminOrder(id, body, user.id));
  } catch (error) {
    return handleRouteError(error);
  }
}
