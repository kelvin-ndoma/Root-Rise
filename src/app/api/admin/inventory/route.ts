import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth/permissions";
import { adjustInventory, listInventory } from "@/lib/services/admin.service";
import { inventoryAdjustSchema } from "@/lib/validations/admin";
import { handleRouteError, jsonOk } from "@/lib/utils/api";

export async function GET() {
  try {
    await requireAdmin();
    return jsonOk(await listInventory(40));
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAdmin();
    const body = inventoryAdjustSchema.parse(await request.json());
    return jsonOk(await adjustInventory(body, user.id));
  } catch (error) {
    return handleRouteError(error);
  }
}
