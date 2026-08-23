export const clientPaymentMethods = [
  {
    id: "manual" as const,
    label: "Confirm with Root and Rise",
    description:
      "Place your order now. Payment remains pending until Root and Rise or a payment provider confirms it.",
  },
];

export function listPaymentProviders() {
  return clientPaymentMethods;
}
