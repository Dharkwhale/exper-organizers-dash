import { sortFor, tabFor } from "./classify";
import type { EventRow, EventTab } from "./types";

export type EventQuery = { tab: EventTab; query: string; city: string | null };

export function filterEvents(
  events: EventRow[],
  { tab, query, city }: EventQuery,
  now: Date,
): EventRow[] {
  const needle = query.trim().toLowerCase();
  const matches = events.filter((event) => {
    if (tabFor(event, now) !== tab) return false;
    if (city && event.venue.city !== city) return false;
    if (!needle) return true;
    return (
      event.title.toLowerCase().includes(needle) ||
      (event.venue.city ?? "").toLowerCase().includes(needle)
    );
  });
  return sortFor(tab, matches);
}

export function cities(events: EventRow[]): string[] {
  const names = events.flatMap((event) => (event.venue.city ? [event.venue.city] : []));
  return [...new Set(names)].sort((a, b) => a.localeCompare(b));
}
