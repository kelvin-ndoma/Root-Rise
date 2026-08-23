import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/page-header";
import { OrderActions } from "@/components/admin/order-actions";
import { StatusBadge } from "@/components/admin/status-badge";
import { getAdminOrder } from "@/lib/services/admin.service";
import { formatMoney } from "@/lib/utils/currency";

export const dynamic = "force-dynamic";

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await getAdminOrder(id);
  if (!order) notFound();

  return (
    <div>
      <AdminPageHeader
        eyebrow="Fulfilment"
        title={order.orderNumber}
        description={`${order.customer.name} · ${new Date(order.createdAt).toLocaleString()}`}
      />
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <section className="rounded-3xl bg-white p-4 sm:p-6">
            <div className="mb-4 flex flex-wrap gap-2">
              <StatusBadge value={order.status} />
              <StatusBadge value={order.paymentStatus} />
            </div>
            {order.items.map((item) => (
              <div key={item.id} className="flex flex-col gap-1 border-t border-brand/8 py-3 text-sm first:border-t-0 sm:flex-row sm:justify-between">
                <div className="min-w-0">
                  <p className="font-medium">{item.name}</p>
                  <p className="text-ink/45">
                    {item.sku}
                    {item.variantLabel ? ` · ${item.variantLabel}` : ""} × {item.quantity}
                  </p>
                </div>
                <p>{formatMoney(item.subtotal)}</p>
              </div>
            ))}
            <div className="mt-4 space-y-1 text-sm">
              <p className="flex justify-between text-ink/55">
                <span>Subtotal</span>
                <span>{formatMoney(order.subtotal)}</span>
              </p>
              <p className="flex justify-between text-ink/55">
                <span>Delivery</span>
                <span>{formatMoney(order.deliveryFee)}</span>
              </p>
              {order.discount ? (
                <p className="flex justify-between text-ink/55">
                  <span>Discount {order.couponCode ? `(${order.couponCode})` : ""}</span>
                  <span>-{formatMoney(order.discount)}</span>
                </p>
              ) : null}
              <p className="flex justify-between font-medium">
                <span>Total</span>
                <span>{formatMoney(order.total)}</span>
              </p>
            </div>
          </section>
          <section className="rounded-3xl bg-white p-4 text-sm sm:p-6">
            <h2 className="font-display text-2xl text-brand">Customer</h2>
            <p className="mt-3">{order.customer.name}</p>
            <p className="text-ink/55">{order.customer.email}</p>
            <p className="text-ink/55">{order.customer.phone}</p>
            <h3 className="mt-6 font-medium">Shipping</h3>
            <p className="mt-2 text-ink/70">
              {order.shipping.address}
              <br />
              {order.shipping.town}, {order.shipping.county}
            </p>
            {order.shipping.instructions ? <p className="mt-2 text-ink/55">{order.shipping.instructions}</p> : null}
            {order.notes ? (
              <>
                <h3 className="mt-6 font-medium">Customer notes</h3>
                <p className="mt-2 text-ink/70">{order.notes}</p>
              </>
            ) : null}
          </section>
        </div>
        <div className="space-y-6">
          <OrderActions
            orderId={order.id}
            status={order.status}
            paymentStatus={order.paymentStatus}
            internalNotes={order.internalNotes}
          />
          <section className="rounded-3xl bg-white p-4 sm:p-6">
            <h2 className="font-display text-2xl text-brand">Timeline</h2>
            <ol className="mt-4 space-y-3">
              {order.timeline.map((event, index) => (
                <li key={`${event.status}-${index}`} className="rounded-2xl bg-cream/80 px-4 py-3 text-sm">
                  <p className="font-medium">{event.status.replaceAll("_", " ")}</p>
                  <p className="text-ink/50">{new Date(event.at).toLocaleString()}</p>
                  {event.note ? <p className="mt-1 text-ink/70">{event.note}</p> : null}
                </li>
              ))}
            </ol>
          </section>
        </div>
      </div>
    </div>
  );
}
