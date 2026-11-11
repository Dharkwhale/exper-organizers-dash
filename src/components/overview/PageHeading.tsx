import Link from "next/link";
import { buttonClasses } from "@/components/auth/Button";
import { formatLongDate } from "@/lib/overview/format";

export function PageHeading({ now }: { now: Date }) {
  return (
    <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
      <div className="min-w-0">
        <h1 className="text-[clamp(2rem,4.5vw,3.25rem)] font-bold leading-[1.05] tracking-tight">
          The night, in view.
        </h1>
        <p className="mt-2 text-[11px] text-muted">
          {`${formatLongDate(now)} · Your events, from first idea to last memory.`}
        </p>
      </div>
      <div className="shrink-0 sm:pt-1">
        <Link href="/events/setup/basics" className={buttonClasses("primary", "gap-2")}>
          <span aria-hidden>+</span>
          Create event
        </Link>
      </div>
    </div>
  );
}
