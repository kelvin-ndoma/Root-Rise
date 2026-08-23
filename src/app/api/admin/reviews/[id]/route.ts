import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth/permissions";
import { deleteAdminReview, updateAdminReview } from "@/lib/services/admin.service";
import { reviewUpdateSchema } from "@/lib/validations/admin";
import { handleRouteError, jsonOk } from "@/lib/utils/api";

type Params = Promise<{ id: string }>;

export async function PATCH(request: NextRequest, { params }: { params: Params }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = reviewUpdateSchema.parse(await request.json());
    return jsonOk(await updateAdminReview(id, body.isApproved));
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Params }) {
  try {
    await requireAdmin();
    const { id } = await params;
    await deleteAdminReview(id);
    return jsonOk({ ok: true });
  } catch (error) {
    return handleRouteError(error);
  }
}
