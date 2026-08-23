import { EmptyState } from "@/components/ui/empty-state";

export default function WishlistPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="mb-8 font-display text-3xl text-brand sm:text-4xl md:text-5xl">Wishlist</h1>
      <EmptyState
        title="Your wishlist is empty"
        description="Save products you love and move them to your cart when you are ready."
        action={{ href: "/shop", label: "Browse products" }}
      />
    </div>
  );
}
