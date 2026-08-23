import { listActiveCategories } from "@/lib/services/category.service";
import { handleRouteError, jsonOk } from "@/lib/utils/api";

export async function GET() {
  try {
    const categories = await listActiveCategories();
    return jsonOk({ items: categories });
  } catch (error) {
    return handleRouteError(error);
  }
}
