import { z } from "zod";
import {
  AVAILABILITY_FILTERS,
  PRODUCT_SORT_OPTIONS,
} from "@/types";

export const productListQuerySchema = z.object({
  q: z.string().trim().max(120).optional(),
  category: z.string().trim().optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  availability: z.enum(AVAILABILITY_FILTERS).optional().default("all"),
  sort: z.enum(PRODUCT_SORT_OPTIONS).optional().default("featured"),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(48).optional().default(12),
});

export type ProductListQuery = z.infer<typeof productListQuerySchema>;
