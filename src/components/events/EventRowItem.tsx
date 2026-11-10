import { formatEventRange } from "@/lib/events/format";
import type { EventRow } from "@/lib/events/types";
import { utcOffset } from "@/lib/overview/format";
import { ActionButton } from "@/components/overview/ActionButton";

const count = (n: number) => n.toLocaleString("en-GB");

function tickets({ sold, capacity }: Pick<EventRow, "sold" | "capacity">): string {
  if (sold === null) return "—";
  if (capacity === null) return count(sold);
  return `${count(sold)} / ${count(capacity)}`;
}

export function EventRowItem({ event }: { event: EventRow }) {
  const place = [event.venue.name, event.venue.city].filter(Boolean).join(" · ");
  const zone = `${event.timezone} · ${utcOffset(event.timezone, new Date(event.startsAt))}`;

  return (
    <article className="flex flex-col gap-4 border-b border-border/60 py-6 last:border-b-0 sm:flex-row sm:items-center">
      <div className="h-24 w-20 shrink-0 overflow-hidden rounded-2xl bg-surface-2">
        {event.coverImageUrl ? (
          // Decorative: the event title beside it names the row.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={event.coverImageUrl} alt="" className="size-full object-cover" />
        ) : (
          <div data-cover-placeholder className="size-full" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="truncate text-xl font-medium">{event.title}</h3>
        {place ? <p className="mt-1 text-[11px] text-muted">{place}</p> : null}
        <p className="mt-2 text-xs">{formatEventRange(event.startsAt, event.endsAt, event.timezone)}</p>
        <p className="mt-1 text-[11px] text-muted">{zone}</p>
      </div>

      <div className="flex flex-col gap-3 sm:items-start">
        <div>
          <p className="text-xs">{tickets(event)}</p>
          {event.currency ? (
            <p className="mt-1 text-[11px] text-muted">{`Event currency · ${event.currency}`}</p>
          ) : null}
        </div>
        <ActionButton variant="secondary">Manage event</ActionButton>
      </div>
    </article>
  );
}
