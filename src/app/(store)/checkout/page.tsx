import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { CheckoutForm } from "@/components/forms/checkout-form";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Complete your Root and Rise order.",
};

export default async function CheckoutPage() {
  const session = await auth();
  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <h1 className="mb-8 font-display text-5xl text-brand">Checkout</h1>
      <CheckoutForm defaultName={session?.user?.name ?? undefined} defaultEmail={session?.user?.email ?? undefined} />
    </div>
  );
}
