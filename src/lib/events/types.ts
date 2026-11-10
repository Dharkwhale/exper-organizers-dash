export type EventTab = "upcoming" | "live" | "past" | "drafts";

/** One row on the Events page: the list entry plus what each event's detail and guest count add. */
export type EventRow = {
  id: string;
  title: string;
  status: string;
  startsAt: string;
  endsAt: string;
  venue: { name: string | null; city: string | null };
  coverImageUrl: string | null;
  timezone: string;
  capacity: number | null;
  /** Tickets issued (the guest total), or null when it could not be loaded. */
  sold: number | null;
  currency: string | null;
};

export type EventsData = {
  events: EventRow[];
  truncated: boolean;
  /** The instant the server classified against, so the client agrees with it. */
  nowIso: string;
};
