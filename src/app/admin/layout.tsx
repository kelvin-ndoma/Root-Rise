import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { AdminShell } from "@/components/admin/admin-shell";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: { absolute: `${siteConfig.name} admin` },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  return (
    <AdminShell userName={session?.user?.name} userEmail={session?.user?.email}>
      {children}
    </AdminShell>
  );
}
