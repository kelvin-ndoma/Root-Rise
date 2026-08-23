import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth/permissions";
import { listAdminOrders } from "@/lib/services/admin.service";
import { adminOrderListQuerySchema } from "@/lib/validations/admin";
import { handleRouteError, jsonOk } from "@/lib/utils/api";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const query = adminOrderListQuerySchema.parse(Object.fromEntries(request.nextUrl.searchParams));
    return jsonOk(await listAdminOrders(query));
  } catch (error) {
    return handleRouteError(error);
  }
}
