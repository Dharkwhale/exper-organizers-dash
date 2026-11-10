import type { EventRow, EventTab } from "./types";

export function tabFor(
  event: Pick<EventRow, "status" | "startsAt" | "endsAt">,
  now: Date,
): EventTab {
  if (event.status !== "published") return "drafts";
  const at = now.getTime();
  if (at < Date.parse(event.startsAt)) return "upcoming";
  if (at <= Date.parse(event.endsAt)) return "live";
  return "past";
}

export function sortFor(tab: EventTab, events: EventRow[]): EventRow[] {
  const direction = tab === "past" ? -1 : 1;
  return [...events].sort(
    (a, b) => direction * (Date.parse(a.startsAt) - Date.parse(b.startsAt)),
  );
}
