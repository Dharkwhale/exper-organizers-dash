import type { EventRow, EventsData } from "@/lib/events/types";
import { backendFetch } from "./backend";
import { readToken, toFailure, type Failure } from "./overview";

// Each event costs two extra calls (detail and guest count), so the page
// shows the newest 50 and says so rather than fanning out for all 200.
export const MAX_EVENTS = 50;

export type EventsResult = { ok: true; data: EventsData } | Failure;

type ListEntry = Pick<EventRow, "id" | "title" | "status" | "startsAt" | "endsAt" | "venue">;

type DetailResponse = {
  coverImageUrl: string | null;
  timezone: string;
  capacity: number | null;
  ticketTypes: { price: { currency: string | null } }[];
};

async function loadRow(entry: ListEntry, bearer: string): Promise<EventRow> {
  const [detail, guests] = await Promise.all([
    backendFetch<DetailResponse>(`/organizer/experiences/${entry.id}`, { bearer }),
    backendFetch<{ total: number }>(
      `/organizer/experiences/${entry.id}/guests?page=1&limit=1`,
      { bearer },
    ),
  ]);

  return {
    ...entry,
    coverImageUrl: detail.ok ? detail.data.coverImageUrl : null,
    timezone: detail.ok ? detail.data.timezone : "UTC",
    capacity: detail.ok ? detail.data.capacity : null,
    currency: detail.ok ? (detail.data.ticketTypes[0]?.price.currency ?? null) : null,
    sold: guests.ok ? guests.data.total : null,
  };
}

export async function getEvents(now?: Date): Promise<EventsResult> {
  const bearer = await readToken();
  if (!bearer) {
    return { ok: false, reason: "unauthorized", message: "Sign in to continue." };
  }
  // The clock is read after the cookie: with cacheComponents, `new Date()`
  // before request-time data is a prerender error.
  const at = now ?? new Date();

  const list = await backendFetch<{ data: ListEntry[] }>("/organizer/experiences", {
    bearer,
  });
  if (!list.ok) return toFailure(list);

  const events = await Promise.all(
    list.data.data.slice(0, MAX_EVENTS).map((entry) => loadRow(entry, bearer)),
  );

  return {
    ok: true,
    data: {
      events,
      truncated: list.data.data.length > MAX_EVENTS,
      nowIso: at.toISOString(),
    },
  };
}
