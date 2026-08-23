import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth/permissions";
import { getAdminProduct, updateAdminProduct } from "@/lib/services/admin.service";
import { productUpdateSchema } from "@/lib/validations/admin";
import { handleRouteError, jsonError, jsonOk } from "@/lib/utils/api";

type Params = Promise<{ id: string }>;

export async function GET(_request: NextRequest, { params }: { params: Params }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const product = await getAdminProduct(id);
    if (!product) return jsonError("Product not found.", 404);
    return jsonOk(product);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Params }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = productUpdateSchema.parse(await request.json());
    return jsonOk(await updateAdminProduct(id, body));
  } catch (error) {
    return handleRouteError(error);
  }
}
