import Image from "next/image";
import Link from "next/link";
import { SOON_LABELS } from "./nav";
import { NavItem } from "./NavItem";
import { SignOutButton } from "./SignOutButton";

export function Sidebar({
  open,
  section,
  workspaceName,
  userName,
  roleLine,
}: {
  open: boolean;
  section: "overview" | "events" | "experience-builder" | "live-control";
  workspaceName: string | null;
  userName: string | null;
  roleLine: string;
}) {
  return (
    <aside
      id="app-sidebar"
      className={`${open ? "flex" : "hidden"} fixed inset-y-0 left-0 z-30 w-52 flex-col overflow-y-auto bg-surface px-7 py-8 lg:flex lg:bg-surface/50`}
    >
      <Link
        href="/overview"
        className="flex items-center gap-2 text-lg font-semibold tracking-wide"
      >
        {/* Decorative: the "EXPER" wordmark next to it names the link. */}
        <Image src="/exper-logo.png" alt="" width={28} height={28} className="size-7" />
        EXPER
      </Link>

      <div className="mt-10">
        <p className="text-xs">
          <span>{workspaceName ?? "Your workspace"}</span>
          <span aria-hidden> ⌄</span>
        </p>
        <p className="mt-1 text-[11px] text-muted">Organiser workspace</p>
      </div>

      <nav aria-label="Main" className="mt-10 flex flex-col">
        <NavItem label="Overview" href="/overview" current={section === "overview"} />
        <NavItem label="Events" href="/events" current={section === "events"} />
        <NavItem
          label="Experience Builder"
          href="/experience-builder"
          current={section === "experience-builder"}
        />
        <NavItem
          label="Live Control"
          href="/live-control"
          current={section === "live-control"}
        />
        {SOON_LABELS.map((label) => (
          <NavItem key={label} label={label} />
        ))}
      </nav>

      <div className="mt-auto pt-10">
        <p className="text-xs">{userName ?? "Your account"}</p>
        <p className="mt-1 text-[11px] text-muted">{roleLine}</p>
        <SignOutButton />
        <p className="mt-6 text-[11px] text-muted">Help &amp; support</p>
      </div>
    </aside>
  );
}
