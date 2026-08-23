import { NextRequest } from "next/server";
import { listProducts, searchSuggestions } from "@/lib/services/product.service";
import { productListQuerySchema } from "@/lib/validations/product";
import { handleRouteError, jsonOk } from "@/lib/utils/api";

export async function GET(request: NextRequest) {
  try {
    const params = Object.fromEntries(request.nextUrl.searchParams);
    const parsed = productListQuerySchema.parse({ ...params, limit: params.limit ?? "6" });
    if (request.nextUrl.searchParams.get("suggest") === "1") {
      return jsonOk({ items: await searchSuggestions(parsed.q ?? "") });
    }
    const result = await listProducts(parsed);
    return jsonOk(result);
  } catch (error) {
    return handleRouteError(error);
  }
}
