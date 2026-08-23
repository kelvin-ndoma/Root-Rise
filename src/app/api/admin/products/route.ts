import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth/permissions";
import { createAdminProduct, listAdminProducts } from "@/lib/services/admin.service";
import { adminProductListQuerySchema, productWriteSchema } from "@/lib/validations/admin";
import { handleRouteError, jsonOk } from "@/lib/utils/api";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const query = adminProductListQuerySchema.parse(Object.fromEntries(request.nextUrl.searchParams));
    return jsonOk(await listAdminProducts(query));
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const body = productWriteSchema.parse(await request.json());
    return jsonOk(await createAdminProduct(body), 201);
  } catch (error) {
    return handleRouteError(error);
  }
}
