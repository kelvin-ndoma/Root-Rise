import { manualPaymentProvider } from "@/lib/payments/providers/manual";
import type { PaymentProvider } from "@/lib/payments/types";
import type { PaymentProviderId } from "@/models/Payment";

const providers: PaymentProvider[] = [manualPaymentProvider];

export function listPaymentProviders() {
  return providers.filter((provider) => provider.isEnabled);
}

export function getPaymentProvider(id: PaymentProviderId) {
  const provider = providers.find((item) => item.id === id && item.isEnabled);
  if (!provider) {
    throw new Error("Selected payment method is not available yet.");
  }
  return provider;
}
