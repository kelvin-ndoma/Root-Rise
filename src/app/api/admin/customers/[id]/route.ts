import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth/permissions";
import { getAdminCustomer, updateAdminCustomer } from "@/lib/services/admin.service";
import { customerUpdateSchema } from "@/lib/validations/admin";
import { handleRouteError, jsonError, jsonOk } from "@/lib/utils/api";

type Params = Promise<{ id: string }>;

export async function GET(_request: NextRequest, { params }: { params: Params }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const customer = await getAdminCustomer(id);
    if (!customer) return jsonError("Customer not found.", 404);
    return jsonOk(customer);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Params }) {
  try {
    const user = await requireAdmin();
    const { id } = await params;
    const body = customerUpdateSchema.parse(await request.json());
    return jsonOk(await updateAdminCustomer(id, body, user.role));
  } catch (error) {
    return handleRouteError(error);
  }
}
