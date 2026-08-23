import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth/permissions";
import { updateAdminCategory } from "@/lib/services/admin.service";
import { categoryUpdateSchema } from "@/lib/validations/admin";
import { handleRouteError, jsonOk } from "@/lib/utils/api";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = categoryUpdateSchema.parse(await request.json());
    return jsonOk(await updateAdminCategory(id, body));
  } catch (error) {
    return handleRouteError(error);
  }
}
