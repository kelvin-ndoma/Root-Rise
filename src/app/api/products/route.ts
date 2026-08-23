import { NextRequest } from "next/server";
import { productListQuerySchema } from "@/lib/validations/product";
import { listProducts } from "@/lib/services/product.service";
import { handleRouteError, jsonOk } from "@/lib/utils/api";

export async function GET(request: NextRequest) {
  try {
    const query = productListQuerySchema.parse(Object.fromEntries(request.nextUrl.searchParams));
    const result = await listProducts(query);
    return jsonOk(result);
  } catch (error) {
    return handleRouteError(error);
  }
}
