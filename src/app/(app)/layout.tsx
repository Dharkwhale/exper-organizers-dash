import { redirect } from "next/navigation";
import { Suspense, type ReactNode } from "react";
import { AppShell } from "@/components/app/AppShell";
import { mockOverview } from "@/lib/overview/mock";
import { getShellIdentity } from "@/lib/server/overview";

async function Shell({ children }: { children: ReactNode }) {
  const identity = await getShellIdentity();
  if (!identity.ok && identity.reason === "unauthorized") redirect("/sign-in");

  // Any other failure still renders the shell; the page shows its own error.
  const names = identity.ok
    ? identity.data
    : { workspaceName: null, userName: null };
  return (
    <AppShell
      workspaceName={names.workspaceName}
      userName={names.userName}
      roleLine={mockOverview().roleLine}
    >
      {children}
    </AppShell>
  );
}

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-bg" aria-busy="true" />}>
      <Shell>{children}</Shell>
    </Suspense>
  );
}
