import type { InitiatePaymentInput, InitiatePaymentResult, PaymentProvider } from "@/lib/payments/types";

export const manualPaymentProvider: PaymentProvider = {
  id: "manual",
  label: "Pay later / confirm with Root and Rise",
  description:
    "Place your order now. Payment stays pending until Root and Rise confirms it. Orders are not marked paid until confirmation is received.",
  isEnabled: true,
  async initiate(input: InitiatePaymentInput): Promise<InitiatePaymentResult> {
    return {
      provider: "manual",
      status: "PENDING",
      instructions:
        "Your order has been placed. A Root and Rise team member will confirm payment before fulfilment.",
      providerReference: `MANUAL-${input.orderNumber}`,
      metadata: { initiatedAt: new Date().toISOString() },
    };
  },
};
