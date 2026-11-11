import type { EventRow, EventsData } from "./types";

/**
 * Figma Events → Upcoming populated state.
 * Used in the design phase when the API has no events yet.
 * `nowIso` is fixed before every start so all four land on Upcoming.
 */
export function designEventsData(): EventsData {
  const events: EventRow[] = [
    {
      id: "figma-sound-scape",
      title: "Sound/Scape",
      status: "published",
      startsAt: "2026-10-31T18:00:00Z",
      endsAt: "2026-10-31T22:30:00Z",
      venue: { name: "Landmark Beach", city: "Lagos" },
      coverImageUrl: "/events/sound-scape.jpg",
      timezone: "Africa/Lagos",
      capacity: 900,
      sold: 683,
      currency: "NGN",
    },
    {
      id: "figma-rooftop",
      title: "Rooftop Sessions",
      status: "published",
      startsAt: "2026-11-06T18:30:00Z",
      endsAt: "2026-11-06T23:00:00Z",
      venue: { name: "The Nest", city: "London" },
      coverImageUrl: "/events/rooftop-sessions.jpg",
      timezone: "Europe/London",
      capacity: 280,
      sold: 214,
      currency: "GBP",
    },
    {
      id: "figma-accra",
      title: "Accra After Dark",
      status: "published",
      startsAt: "2026-11-14T20:00:00Z",
      endsAt: "2026-11-15T02:00:00Z",
      venue: { name: "Black Star Square", city: "Accra" },
      coverImageUrl: "/events/accra-after-dark.jpg",
      timezone: "Africa/Accra",
      capacity: 500,
      sold: 401,
      currency: "GHS",
    },
    {
      id: "figma-nairobi",
      title: "Nairobi Frequency",
      status: "published",
      startsAt: "2026-11-21T14:00:00Z",
      endsAt: "2026-11-21T20:00:00Z",
      venue: { name: "Ngong Racecourse", city: "Nairobi" },
      coverImageUrl: "/events/nairobi-frequency.jpg",
      timezone: "Africa/Nairobi",
      capacity: 1200,
      sold: 912,
      currency: "KES",
    },
  ];

  return {
    events,
    truncated: false,
    nowIso: "2026-10-20T12:00:00Z",
  };
}
