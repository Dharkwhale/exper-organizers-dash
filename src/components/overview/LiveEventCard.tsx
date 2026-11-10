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
    <Card className="grid gap-6 md:grid-cols-[minmax(0,280px)_1fr]">
      <div>
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

      <div className="flex flex-col">
        <p className="flex items-center gap-1.5 text-[11px] font-medium text-accent">
          <span aria-hidden className="size-1.5 rounded-full bg-accent" />
          {badge}
        </p>
        <h2 className="mt-3 text-3xl font-medium tracking-tight">{event.title}</h2>
        <p className="mt-3 text-xs text-muted">
          {formatEventWindow(event.startsAt, event.endsAt, zone)}
        </p>

        <div className="mt-6 grid grid-cols-2 gap-4">
          <div>
            <p className="text-3xl font-medium">
              {`${count(checkedIn)}${checkedInCapped ? "+" : ""}`}
            </p>
            <p className="mt-1 text-[11px] text-muted">
              {`checked in / ${count(attendees)} attendees`}
            </p>
          </div>
          {mode === "live" ? (
            <div>
              <p className="text-3xl font-medium">{count(activeNow)}</p>
              <p className="mt-1 text-[11px] text-muted">
                active in the last 5 minutes
              </p>
            </div>
          ) : null}
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <ActionButton variant="primary" icon="◉">
            Open Live Control
          </ActionButton>
          <ActionButton variant="secondary" icon="⛶">
            Check in guests
          </ActionButton>
        </div>
      </div>
    </Card>
  );
}
