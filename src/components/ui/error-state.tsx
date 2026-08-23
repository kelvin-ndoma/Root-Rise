export function ErrorState({ title = "Something went wrong", description }: { title?: string; description?: string }) {
  return (
    <div className="rounded-3xl bg-white px-6 py-16 text-center shadow-sm">
      <h2 className="font-display text-2xl text-brand">{title}</h2>
      <p className="mx-auto mt-3 max-w-md text-sm text-ink/60">
        {description ?? "Please refresh the page or try again in a moment."}
      </p>
    </div>
  );
}
