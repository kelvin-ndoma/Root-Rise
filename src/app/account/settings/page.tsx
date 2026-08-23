import { auth } from "@/lib/auth";

export default async function SettingsPage() {
  const session = await auth();
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-display text-3xl text-brand sm:text-4xl md:text-5xl">Account settings</h1>
      <div className="mt-8 rounded-3xl bg-white p-6 text-sm">
        <p>
          <span className="text-ink/50">Name</span>
          <br />
          {session?.user?.name}
        </p>
        <p className="mt-4">
          <span className="text-ink/50">Email</span>
          <br />
          {session?.user?.email}
        </p>
        <p className="mt-4">
          <span className="text-ink/50">Role</span>
          <br />
          {session?.user?.role}
        </p>
      </div>
    </div>
  );
}
