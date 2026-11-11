import type { EventDraft } from "./types";

/** Figma Neon Solstice draft used across the Event setup flow. */
export function designEventDraft(): EventDraft {
  return {
    title: "Neon Solstice",
    description:
      "Where kinetic light, spatial sound, and human presence fuse into a living collective pulse.",
    category: "Music & nightlife",
    slug: "neon-solstice",
    coverImageUrl: "/overview/neon-solstice.jpg",
    coverMeta: "Existing cover · JPG · 2.4 MB",
    status: "Draft",
    savedAtLabel: "All changes saved at 21:34 WAT",
    venueName: "Landmark Beach",
    address: "Water Corporation Road, Victoria Island",
    city: "Lagos",
    country: "Nigeria",
    startLabel: "25 Oct 2026 / 20:00",
    endLabel: "26 Oct 2026 / 03:30",
    endNote: "Ends the following day · 7 hours 30 minutes",
    timezone: "Africa/Lagos",
    timezoneNote: "WAT · UTC+01:00 on event date. Select any IANA timezone.",
    showVenueBeforePurchase: true,
    currency: "NGN",
    currencyLabel: "NGN — Nigerian naira",
    accessMode: "paid",
    tickets: [
      {
        id: "ga",
        name: "General Access",
        price: 25000,
        quantity: 1000,
        guestsPerTicket: 1,
        description: "Standard floor & dynamic lights",
      },
      {
        id: "vip",
        name: "VIP · Soundscape",
        price: 65000,
        quantity: 200,
        guestsPerTicket: 1,
        description: "Elevated mezzanine",
      },
      {
        id: "squad",
        name: "Squad Bundle (4×)",
        price: 85000,
        quantity: 100,
        guestsPerTicket: 4,
        description: "One QR per guest",
      },
    ],
    salesCloseLabel: "25 Oct 2026 · 23:00 WAT",
    refundPolicy: "Refunds available until 48 hours before doors.",
    experience: [
      {
        id: "prompts",
        title: "Room prompts",
        status: "Enabled",
        detail: "Live polls and text prompts during the night.",
      },
      {
        id: "missions",
        title: "Squad missions",
        status: "Enabled",
        detail: "Private squad tasks with timed windows.",
      },
      {
        id: "leaderboard",
        title: "Public leaderboard",
        status: "Off",
        detail: "Squad scores stay private for this draft.",
      },
      {
        id: "photos",
        title: "Photo moderation",
        status: "Required",
        detail: "Moments need review before they go public.",
      },
    ],
    runOfShow: [
      {
        id: "1",
        title: "One has to go",
        meta: "21:30 · Poll · 2 minutes",
      },
      {
        id: "2",
        title: "What is the DJ actually doing up there?",
        meta: "21:39 · Text prompt · 3 minutes",
      },
      {
        id: "3",
        title: "Find Something Blue",
        meta: "21:45 · Photo mission · 5 minutes",
      },
      {
        id: "4",
        title: "Write tonight's headline",
        meta: "22:00 · Private squad mission · 4 minutes",
      },
    ],
    visibility: "Public · Listed in discovery",
    checklistNote: "Cover, venue, timezone, tickets and refund policy complete.",
  };
}

export function formatNaira(amount: number): string {
  return `₦${amount.toLocaleString("en-NG")}`;
}

export function totalGuestCapacity(
  tickets: EventDraft["tickets"],
): { total: number; breakdown: string } {
  const total = tickets.reduce(
    (sum, ticket) => sum + ticket.quantity * ticket.guestsPerTicket,
    0,
  );
  const parts = tickets.map((ticket) =>
    ticket.guestsPerTicket > 1
      ? `(${ticket.quantity.toLocaleString("en-GB")} × ${ticket.guestsPerTicket})`
      : ticket.quantity.toLocaleString("en-GB"),
  );
  return {
    total,
    breakdown: `(${parts.join(" + ")})`,
  };
}
