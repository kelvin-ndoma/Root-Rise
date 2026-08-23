import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { Category } from "@/models/Category";
import { Product } from "@/models/Product";

function catalogError(error: unknown) {
  if (!(error instanceof Error)) return "Unknown database error";
  if (error.message.includes("MONGODB_URI is not configured")) {
    return "MONGODB_URI is not set on this environment";
  }
  if (/authentication failed|bad auth/i.test(error.message)) {
    return "MongoDB authentication failed";
  }
  return "Cannot reach MongoDB. In Atlas Network Access allow 0.0.0.0/0, and set the same MONGODB_URI on Vercel Production.";
}

export async function GET() {
  try {
    await connectDB();
    const [products, categories] = await Promise.all([
      Product.countDocuments({ isActive: true }),
      Category.countDocuments({ isActive: true }),
    ]);
    return NextResponse.json({ ok: true, database: "connected", products, categories });
  } catch (error) {
    return NextResponse.json({ ok: false, database: "disconnected", error: catalogError(error) }, { status: 503 });
  }
}
