"use client";

import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { Sidebar } from "./Sidebar";

const SECTION_LABEL = { overview: "Overview", events: "Events" } as const;

export function AppShell({
  workspaceName,
  userName,
  roleLine,
  children,
}: {
  workspaceName: string | null;
  userName: string | null;
  roleLine: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const section =
    pathname === "/events" || pathname.startsWith("/events/") ? "events" : "overview";

  return (
    <div className="min-h-dvh bg-bg lg:pl-52">
      <Sidebar
        open={open}
        section={section}
        workspaceName={workspaceName}
        userName={userName}
        roleLine={roleLine}
      />
      <div className="min-w-0">
        <header className="flex h-16 items-center gap-3 border-b border-border/60 px-5 lg:px-7">
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="app-sidebar"
            onClick={() => setOpen((value) => !value)}
            className="relative z-40 rounded-full bg-surface-2 px-3 py-1.5 text-[11px] font-semibold lg:hidden"
          >
            {open ? "Close" : "Menu"}
          </button>
          <nav aria-label="Breadcrumb">
            <p className="text-xs text-muted">
              {`${workspaceName ?? "Your workspace"} / ${SECTION_LABEL[section]} · ${userName ?? "Your account"}`}
            </p>
          </nav>
        </header>
        <main className="px-5 pb-16 pt-12 lg:px-7">{children}</main>
      </div>
    </div>
  );
}
