import { EmptyState } from "@/components/ui/empty-state";

export default function AddressesPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="mb-8 font-display text-3xl text-brand sm:text-4xl md:text-5xl">Addresses</h1>
      <EmptyState
        title="No saved addresses"
        description="Addresses added at checkout will appear here in the next increment."
        action={{ href: "/account", label: "Back to account" }}
      />
    </div>
  );
}
