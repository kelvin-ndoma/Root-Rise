import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { ProductGallery } from "@/components/store/product-gallery";
import { ProductPurchase } from "@/components/store/product-purchase";
import { ProductGrid } from "@/components/store/product-grid";
import { getProductBySlug, getRelatedProducts } from "@/lib/services/product.service";
import { siteConfig } from "@/config/site";

export const dynamic = "force-dynamic";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug).catch(() => null);
  if (!product) return { title: "Product" };
  const title = product.seoTitle || product.name;
  const description = product.seoDescription || product.description.slice(0, 160);
  return {
    title: product.seoTitle ? { absolute: product.seoTitle } : title,
    description,
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: {
      title: `${title} | ${siteConfig.name}`,
      description,
      images: product.images[0]?.url ? [{ url: product.images[0].url }] : undefined,
    },
  };
}

export default async function ProductPage({ params }: { params: Params }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const related = await getRelatedProducts(product);

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <Breadcrumbs
        items={[
          { href: "/", label: "Home" },
          { href: "/shop", label: "Shop" },
          product.category
            ? { href: `/categories/${product.category.slug}`, label: product.category.name }
            : { label: "Product" },
          { label: product.name },
        ]}
      />
      <div className="mt-8 grid gap-10 lg:grid-cols-2">
        <ProductGallery images={product.images} name={product.name} />
        <ProductPurchase product={product} />
      </div>
      <section className="mt-16 grid gap-8 lg:grid-cols-2">
        <div>
          <h2 className="font-display text-3xl text-brand">Description</h2>
          <p className="mt-4 whitespace-pre-line text-sm leading-7 text-ink/70">{product.description}</p>
        </div>
        <div>
          <h2 className="font-display text-3xl text-brand">Specifications</h2>
          <dl className="mt-4 divide-y divide-brand/10 rounded-3xl bg-white">
            {product.specifications.map((spec) => (
              <div key={spec.name} className="flex justify-between px-5 py-3 text-sm">
                <dt className="text-ink/50">{spec.name}</dt>
                <dd>{spec.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
      <section className="mt-16">
        <h2 className="font-display text-3xl text-brand">Related products</h2>
        <div className="mt-8">
          <ProductGrid products={related} />
        </div>
      </section>
    </div>
  );
}
