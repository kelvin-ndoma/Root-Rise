import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { listActiveCategories } from "@/lib/services/category.service";
import { listProducts } from "@/lib/services/product.service";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = ["", "/shop", "/search", "/cart"].map((path) => ({
    url: `${siteConfig.url}${path || "/"}`,
    lastModified: new Date(),
  }));

  try {
    const [categories, products] = await Promise.all([
      listActiveCategories(),
      listProducts({ page: 1, limit: 48, availability: "all", sort: "newest" }),
    ]);

    return [
      ...staticRoutes,
      ...categories.map((category) => ({
        url: `${siteConfig.url}/categories/${category.slug}`,
        lastModified: new Date(),
      })),
      ...products.items.map((product) => ({
        url: `${siteConfig.url}/products/${product.slug}`,
        lastModified: new Date(),
      })),
    ];
  } catch {
    return staticRoutes;
  }
}
