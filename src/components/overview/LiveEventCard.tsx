import Link from "next/link";
import { buttonClasses } from "@/components/auth/Button";
import { formatEventWindow, utcOffset } from "@/lib/overview/format";
import type { Overview } from "@/lib/overview/types";
import { ActionButton } from "./ActionButton";
import { Card } from "./Card";

const count = (n: number) => n.toLocaleString("en-GB");

export function LiveEventCard({
  hero,
  activeNow,
}: {
  hero: NonNullable<Overview["hero"]>;
  activeNow: number;
}) {
  const { mode, event, detail, checkedIn, attendees, checkedInCapped } = hero;
  const zone = detail.timezone;
  const badge = `${mode === "live" ? "LIVE NOW" : "UP NEXT"} · ${zone} · ${utcOffset(zone, new Date(event.startsAt))}`;
  const place = [
    detail.venue.name,
    [detail.venue.address, detail.venue.city].filter(Boolean).join(", "),
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <Card className="grid gap-6 md:grid-cols-[minmax(0,min(100%,280px))_1fr] md:items-start">
      <div className="min-w-0">
        <div className="aspect-[3/2] overflow-hidden rounded-2xl bg-surface-2">
          {detail.coverImageUrl ? (
            // Decorative: the event title beside it names the card.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={detail.coverImageUrl}
              alt=""
              className="size-full object-cover"
            />
          ) : (
            <div data-cover-placeholder className="size-full" />
          )}
        </div>
        {place ? <p className="mt-3 text-[11px] text-muted">{place}</p> : null}
      </div>

      <div className="flex min-w-0 flex-col">
        <p className="flex flex-wrap items-center gap-1.5 text-[11px] font-medium text-accent">
          <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-accent" />
          {badge}
        </p>
        <h2 className="mt-3 text-[clamp(1.75rem,3vw,2.25rem)] font-medium tracking-tight">
          {event.title}
        </h2>
        <p className="mt-3 text-xs text-muted">
          {formatEventWindow(event.startsAt, event.endsAt, zone)}
        </p>

        <div className="mt-6 grid grid-cols-2 gap-4">
          <div>
            <p className="text-[clamp(1.75rem,3vw,2.25rem)] font-medium">
              {`${count(checkedIn)}${checkedInCapped ? "+" : ""}`}
            </p>
            <p className="mt-1 text-[11px] text-muted">
              {`checked in / ${count(attendees)} attendees`}
            </p>
          </div>
          {mode === "live" ? (
            <div>
              <p className="text-[clamp(1.75rem,3vw,2.25rem)] font-medium">
                {count(activeNow)}
              </p>
              <p className="mt-1 text-[11px] text-muted">
                active in the last 5 minutes
              </p>
            </div>
          ) : null}
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/live-control" className={buttonClasses("primary", "gap-2")}>
            <span aria-hidden>◉</span>
            Open Live Control
          </Link>
          <ActionButton variant="secondary" icon="⛶">
            Check in guests
          </ActionButton>
        </div>
      </div>
    </Card>
  );
}
