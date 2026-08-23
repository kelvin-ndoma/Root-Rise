"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { checkoutSchema } from "@/lib/validations/checkout";
import { kenyaCounties } from "@/config/site";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import { useCartStore } from "@/lib/store/cart-store";
import { formatMoney } from "@/lib/utils/currency";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { listPaymentProviders } from "@/lib/payments/client-methods";
import type { z } from "zod";

type FormValues = z.infer<typeof checkoutSchema>;

export function CheckoutForm({
  defaultName,
  defaultEmail,
}: {
  defaultName?: string;
  defaultEmail?: string;
}) {
  const { items, totals, hydrated } = useCart();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [couponMessage, setCouponMessage] = useState<string | null>(null);
  const [discount, setDiscount] = useState(0);
  const [county, setCounty] = useState<FormValues["county"]>("Nairobi");
  const providers = listPaymentProviders();

  const form = useForm<FormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      name: defaultName ?? "",
      email: defaultEmail ?? "",
      phone: "",
      county: "Nairobi",
      town: "",
      address: "",
      instructions: "",
      couponCode: "",
      paymentMethod: "manual",
    },
  });

  if (!hydrated) return <div className="h-80 animate-pulse rounded-3xl bg-white" />;

  if (!items.length) {
    router.replace("/cart");
    return null;
  }

  const deliveryFee = county === "Nairobi" || county === "Kiambu" ? 250 : 450;
  const total = Math.max(0, totals.subtotal + deliveryFee - discount);

  return (
    <form
      className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]"
      onSubmit={form.handleSubmit(async (values) => {
        setError(null);
        const response = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...values, items }),
        });
        const data = (await response.json()) as { error?: string; orderId?: string };
        if (!response.ok || !data.orderId) {
          setError(data.error ?? "We could not place your order. Please try again.");
          return;
        }
        useCartStore.getState().clear();
        router.push(`/order-success/${data.orderId}`);
      })}
    >
      <div className="space-y-8">
        <section className="rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="font-display text-2xl text-brand">Customer information</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <Input placeholder="Full name" {...form.register("name")} />
            <Input placeholder="Email" type="email" {...form.register("email")} />
            <Input placeholder="Phone number" {...form.register("phone")} className="md:col-span-2" />
          </div>
        </section>
        <section className="rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="font-display text-2xl text-brand">Delivery information</h2>
          <div className="mt-4 grid gap-4">
            <select
              className="h-11 rounded-xl border border-brand/15 px-3 text-sm"
              {...form.register("county", {
                onChange: (event) => setCounty(event.target.value as FormValues["county"]),
              })}
            >
              {kenyaCounties.map((county) => (
                <option key={county}>{county}</option>
              ))}
            </select>
            <Input placeholder="Town / City" {...form.register("town")} />
            <Input placeholder="Address" {...form.register("address")} />
            <Input placeholder="Additional delivery instructions" {...form.register("instructions")} />
          </div>
        </section>
        <section className="rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="font-display text-2xl text-brand">Payment</h2>
          <p className="mt-2 text-sm text-ink/60">
            Orders stay unpaid until the payment provider confirms the transaction.
          </p>
          <div className="mt-4 grid gap-3">
            {providers.map((provider) => (
              <label key={provider.id} className="flex items-start gap-3 rounded-2xl border border-brand/10 p-4">
                <input type="radio" value={provider.id} {...form.register("paymentMethod")} />
                <span>
                  <span className="block font-medium">{provider.label}</span>
                  <span className="text-sm text-ink/55">{provider.description}</span>
                </span>
              </label>
            ))}
          </div>
        </section>
      </div>
      <aside className="h-fit rounded-3xl bg-white p-6 shadow-sm">
        <h2 className="font-display text-2xl text-brand">Order summary</h2>
        <ul className="mt-4 space-y-3 text-sm">
          {items.map((item) => (
            <li key={`${item.productId}-${item.variantId}`} className="flex justify-between gap-3">
              <span>
                {item.name} {item.variantLabel ? `· ${item.variantLabel}` : ""} × {item.quantity}
              </span>
              <span>{formatMoney(item.unitPrice * item.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex gap-2">
          <Input placeholder="Coupon code" {...form.register("couponCode")} />
          <Button
            type="button"
            variant="outline"
            onClick={async () => {
              const code = form.getValues("couponCode");
              if (!code) return;
              const response = await fetch("/api/coupons/preview", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code, subtotal: totals.subtotal }),
              });
              const data = (await response.json()) as { error?: string; discount?: number; message?: string };
              if (!response.ok) {
                setCouponMessage(data.error ?? "Invalid coupon");
                setDiscount(0);
                return;
              }
              setDiscount(data.discount ?? 0);
              setCouponMessage(data.message ?? "Coupon applied");
            }}
          >
            Apply
          </Button>
        </div>
        {couponMessage ? <p className="mt-2 text-xs text-ink/55">{couponMessage}</p> : null}
        <dl className="mt-5 space-y-2 text-sm">
          <div className="flex justify-between">
            <dt>Subtotal</dt>
            <dd>{formatMoney(totals.subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt>Delivery</dt>
            <dd>{formatMoney(deliveryFee)}</dd>
          </div>
          <div className="flex justify-between">
            <dt>Discount</dt>
            <dd>{formatMoney(discount)}</dd>
          </div>
          <div className="flex justify-between border-t border-brand/10 pt-3 text-base font-medium">
            <dt>Total</dt>
            <dd>{formatMoney(total)}</dd>
          </div>
        </dl>
        {error ? <p className="mt-4 text-sm text-rose">{error}</p> : null}
        <Button type="submit" className="mt-6 w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Placing order..." : "Place order"}
        </Button>
      </aside>
    </form>
  );
}
