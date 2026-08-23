import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth/permissions";
import { listAdminReviews } from "@/lib/services/admin.service";
import { adminReviewListQuerySchema } from "@/lib/validations/admin";
import { handleRouteError, jsonOk } from "@/lib/utils/api";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const query = adminReviewListQuerySchema.parse(Object.fromEntries(request.nextUrl.searchParams));
    return jsonOk(await listAdminReviews(query));
  } catch (error) {
    return handleRouteError(error);
  }
}
