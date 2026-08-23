import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth/permissions";
import { createAdminCategory, listAdminCategories } from "@/lib/services/admin.service";
import { categoryWriteSchema } from "@/lib/validations/admin";
import { handleRouteError, jsonOk } from "@/lib/utils/api";

export async function GET() {
  try {
    await requireAdmin();
    return jsonOk(await listAdminCategories());
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const body = categoryWriteSchema.parse(await request.json());
    return jsonOk(await createAdminCategory(body), 201);
  } catch (error) {
    return handleRouteError(error);
  }
}
