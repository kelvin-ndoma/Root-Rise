import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import mongoose from "mongoose";
import { Category } from "../src/models/Category";
import { Product } from "../src/models/Product";
import { catalogImages, media } from "../src/config/media";

function loadEnv() {
  for (const file of [".env.local", ".env"]) {
    const path = resolve(process.cwd(), file);
    if (!existsSync(path)) continue;
    for (const line of readFileSync(path, "utf8").split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      const value = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
      if (!process.env[key]) process.env[key] = value;
    }
  }
}

const categoryImages: Record<string, string> = {
  "cake-ingredients": media.ingredients,
  decorations: media.sprinkles,
  "baking-tools": media.tools,
  packaging: media.desserts,
  chocolates: media.chocolate,
  "food-colours": media.macarons,
  fondant: media.cakeSlice,
  flavours: media.strawberry,
  "sprinkles-and-dusts": media.sprinkles,
};

async function main() {
  loadEnv();
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is missing");
  await mongoose.connect(process.env.MONGODB_URI, { dbName: "tassel" });

  const categories = await Category.find();
  for (const category of categories) {
    const url = categoryImages[category.slug] ?? catalogImages[0];
    category.image = { url, alt: category.name };
    await category.save();
  }

  const products = await Product.find().sort({ createdAt: 1 });
  for (const [index, product] of products.entries()) {
    const url = catalogImages[index % catalogImages.length];
    product.images = [{ url, alt: product.name }];
    await product.save();
  }

  console.info(`Updated images for ${categories.length} categories and ${products.length} products.`);
  await mongoose.disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
