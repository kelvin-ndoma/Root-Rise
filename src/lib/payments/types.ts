import type { PaymentProviderId } from "@/models/Payment";
import type { PaymentStatus } from "@/types";

export type InitiatePaymentInput = {
  orderId: string;
  orderNumber: string;
  amount: number;
  currency: string;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  returnUrl: string;
};

export type InitiatePaymentResult = {
  provider: PaymentProviderId;
  status: PaymentStatus;
  redirectUrl?: string;
  instructions?: string;
  providerReference?: string;
  metadata?: Record<string, unknown>;
};

export interface PaymentProvider {
  id: PaymentProviderId;
  label: string;
  description: string;
  isEnabled: boolean;
  initiate(input: InitiatePaymentInput): Promise<InitiatePaymentResult>;
}
