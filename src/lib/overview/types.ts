export type EventSummary = {
  id: string;
  title: string;
  status: string;
  startsAt: string;
  endsAt: string;
  venue: { name: string | null; city: string | null };
};

export type EventDetail = EventSummary & {
  coverImageUrl: string | null;
  timezone: string;
  capacity: number | null;
  venue: EventSummary["venue"] & { address: string | null };
};

/** A "Coming up" row: the list endpoint gives no timezone, so it is fetched per row. */
export type ComingUpItem = EventSummary & {
  timezone: string;
  /** Design / future capacity readout; omit when unknown. */
  placesTaken?: number | null;
  capacity?: number | null;
};

export type Hero = { mode: "live" | "upcoming"; event: EventSummary };

export type MockOverview = {
  room: {
    mood: string;
    reactions: number;
    series: { label: string; value: number }[];
  };
  activeNow: number;
  attention: { title: string; detail: string; action: string }[];
  team: { text: string; meta: string }[];
  roleLine: string;
};

export type Overview = {
  user: { fullName: string | null; email: string | null };
  workspaceName: string | null;
  hero:
    | (Hero & {
        detail: EventDetail;
        checkedIn: number;
        attendees: number;
        checkedInCapped: boolean;
      })
    | null;
  comingUp: { items: ComingUpItem[]; total: number };
  mock: MockOverview;
};
