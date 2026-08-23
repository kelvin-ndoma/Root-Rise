import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { AccountShell } from "@/components/account/account-shell";
import { siteConfig } from "@/config/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { absolute: `${siteConfig.name} account` },
};

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  return (
    <AccountShell
      userName={session?.user?.name}
      userEmail={session?.user?.email}
      userRole={session?.user?.role}
    >
      {children}
    </AccountShell>
  );
}
