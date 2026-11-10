import type { EventSummary, Hero } from "./types";

const time = (iso: string) => Date.parse(iso);
const byStart = (a: EventSummary, b: EventSummary) =>
  time(a.startsAt) - time(b.startsAt);
const isPublished = (event: EventSummary) => event.status === "published";

export function selectHero(events: EventSummary[], now: Date): Hero | null {
  const t = now.getTime();
  const published = events.filter(isPublished);

  const live = published
    .filter((e) => time(e.startsAt) <= t && t < time(e.endsAt))
    .sort(byStart)[0];
  if (live) return { mode: "live", event: live };

  const next = published.filter((e) => time(e.startsAt) > t).sort(byStart)[0];
  return next ? { mode: "upcoming", event: next } : null;
}

export function selectComingUp(
  events: EventSummary[],
  heroId: string | null,
  now: Date,
  limit = 4,
): { items: EventSummary[]; total: number } {
  const t = now.getTime();
  const upcoming = events
    .filter((e) => isPublished(e) && time(e.startsAt) > t && e.id !== heroId)
    .sort(byStart);
  return { items: upcoming.slice(0, limit), total: upcoming.length };
}
