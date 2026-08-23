import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth/permissions";
import { listAdminCustomers } from "@/lib/services/admin.service";
import { adminCustomerListQuerySchema } from "@/lib/validations/admin";
import { handleRouteError, jsonOk } from "@/lib/utils/api";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const query = adminCustomerListQuerySchema.parse(Object.fromEntries(request.nextUrl.searchParams));
    return jsonOk(await listAdminCustomers(query));
  } catch (error) {
    return handleRouteError(error);
  }
}
