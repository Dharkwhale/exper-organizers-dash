import Image from "next/image";
import { SOON_LABELS } from "./nav";

const block = "animate-pulse rounded-full bg-surface-2";

/**
 * The app frame, shown while the real shell waits for the person's names. It
 * has the same dimensions as AppShell, so the swap doesn't shift anything, and
 * nothing in it can be clicked.
 */
export function ShellSkeleton() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Loading your workspace"
      className="min-h-dvh bg-bg lg:pl-52"
    >
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-52 flex-col overflow-y-auto bg-surface/50 px-7 py-8 lg:flex">
        <p className="flex items-center gap-2 text-lg font-semibold tracking-wide">
          {/* Decorative: the "EXPER" wordmark beside it names the product. */}
          <Image src="/exper-logo.png" alt="" width={28} height={28} className="size-7" />
          EXPER
        </p>

        <div className="mt-10">
          <div data-skeleton-name className={`h-3 w-28 ${block}`} />
          <p className="mt-2 text-[11px] text-muted">Organiser workspace</p>
        </div>

        <ul className="mt-10 flex flex-col text-[13px] text-muted">
          <li className="py-2">Overview</li>
          <li className="py-2">Events</li>
          <li className="py-2">Experience Builder</li>
          <li className="py-2">Live Control</li>
          <li className="py-2">Attendees</li>
          <li className="py-2">Sales</li>
          <li className="py-2">Moments</li>
          <li className="py-2">Reports</li>
          <li className="py-2">Payouts</li>
          <li className="py-2">Team / Roles</li>
          <li className="py-2">Settings</li>
          {SOON_LABELS.map((label) => (
            <li key={label} className="py-2">
              {label}
            </li>
          ))}
        </ul>

        <div className="mt-auto pt-10">
          <div data-skeleton-name className={`h-3 w-24 ${block}`} />
          <div className={`mt-2 h-2.5 w-32 ${block}`} />
        </div>
      </aside>

      <div className="min-w-0">
        <header className="flex h-16 items-center border-b border-border/60 px-5 lg:px-7">
          <div data-skeleton-name className={`h-3 w-56 ${block}`} />
        </header>
        <main className="px-5 pb-16 pt-12 lg:px-7">
          <div className="mx-auto flex max-w-6xl animate-pulse flex-col gap-6">
            <div className="h-24 w-2/3 rounded-3xl bg-surface" />
            <div className="h-64 rounded-3xl bg-surface" />
          </div>
        </main>
      </div>
    </div>
  );
}
