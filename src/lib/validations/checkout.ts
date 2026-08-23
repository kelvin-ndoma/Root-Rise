import { z } from "zod";
import { kenyaCounties } from "@/config/site";

export const cartMutationSchema = z.object({
  productId: z.string().min(1),
  variantId: z.string().optional(),
  quantity: z.coerce.number().int().min(1).max(99).default(1),
});

export const cartUpdateSchema = z.object({
  productId: z.string().min(1),
  variantId: z.string().optional(),
  quantity: z.coerce.number().int().min(0).max(99),
});

export const couponCodeSchema = z.object({
  code: z.string().trim().min(3).max(32),
});

export const checkoutSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().toLowerCase().email(),
  phone: z.string().trim().min(9).max(20),
  county: z.enum(kenyaCounties),
  town: z.string().trim().min(2).max(80),
  address: z.string().trim().min(5).max(240),
  instructions: z.string().trim().max(500).optional().or(z.literal("")),
  couponCode: z.string().trim().max(32).optional().or(z.literal("")),
  paymentMethod: z.enum(["manual", "mpesa", "card"]),
});
