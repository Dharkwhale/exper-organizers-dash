import type { ComingUpItem, MockOverview, Overview } from "./types";

// Everything here is MOCK: no endpoint exists for it yet. Swap each field for a
// real call as the backend grows; nothing else in the app knows these are fake.
export function mockOverview(): MockOverview {
  return {
    // MOCK: no endpoint (reactions stream)
    room: {
      mood: "High energy",
      reactions: 312,
      series: [
        { label: "20:45", value: 1.2 },
        { label: "20:49", value: 1.5 },
        { label: "20:53", value: 1.0 },
        { label: "20:57", value: 1.9 },
        { label: "21:01", value: 3.0 },
        { label: "21:05", value: 2.4 },
        { label: "21:10", value: 3.4 },
        { label: "21:14", value: 4.6 },
        { label: "21:18", value: 3.9 },
        { label: "21:22", value: 4.7 },
        { label: "21:27", value: 4.1 },
        { label: "21:31", value: 5.1 },
        { label: "21:36", value: 4.5 },
        { label: "21:41", value: 4.8 },
      ],
    },
    // MOCK: no endpoint (live presence)
    activeNow: 876,
    // MOCK: no endpoint (review queue, drafts, payouts)
    attention: [
      {
        title: "Art X is still a draft",
        detail: "Berlin · Venue and access need review",
        action: "Continue",
      },
      {
        title: "13 moments waiting for review",
        detail: "Neon Solstice · Oldest submission 2 min ago",
        action: "Review",
      },
      {
        title: "London payout details verified",
        detail: "GBP balance · Next transfer 28 October",
        action: "View",
      },
    ],
    // MOCK: no endpoint (team activity; team members are not built)
    team: [
      { text: "Kemi approved 8 photos", meta: "21:39 WAT · Moments" },
      { text: "Dami checked in Ada Okafor", meta: "21:38 WAT · Main entrance" },
      { text: "You updated the prompt queue", meta: "21:35 WAT · 3 prompts ready" },
    ],
    // MOCK: no endpoint (workspace roles are not exposed as a label)
    roleLine: "Owner · All events",
  };
}

const neonSummary = {
  id: "figma-neon-solstice",
  title: "Neon Solstice.",
  status: "published",
  startsAt: "2026-10-25T19:00:00Z",
  endsAt: "2026-10-26T02:30:00Z",
  venue: { name: "Landmark Beach", city: "Lagos" },
};

/** Figma Overview populated state — used while the design phase has no live events. */
export function designOverviewHero(): NonNullable<Overview["hero"]> {
  return {
    mode: "live",
    event: neonSummary,
    detail: {
      ...neonSummary,
      coverImageUrl: "/overview/neon-solstice.jpg",
      timezone: "Africa/Lagos",
      capacity: 1240,
      venue: {
        name: "Landmark Beach",
        city: "Lagos",
        address: "Victoria Island",
      },
    },
    checkedIn: 1216,
    attendees: 1240,
    checkedInCapped: false,
  };
}

export function designComingUp(): { items: ComingUpItem[]; total: number } {
  const items: ComingUpItem[] = [
    {
      id: "figma-sound-scape",
      title: "Sound/Scape",
      status: "published",
      startsAt: "2026-10-31T18:00:00Z",
      endsAt: "2026-10-31T23:00:00Z",
      timezone: "Africa/Lagos",
      venue: { name: "Terra Kulture", city: "Lagos" },
      placesTaken: 683,
      capacity: 900,
    },
    {
      id: "figma-rooftop",
      title: "Rooftop Sessions",
      status: "published",
      startsAt: "2026-11-06T18:30:00Z",
      endsAt: "2026-11-06T23:00:00Z",
      timezone: "Europe/London",
      venue: { name: null, city: "London" },
      placesTaken: 214,
      capacity: 280,
    },
    {
      id: "figma-accra",
      title: "Accra After Dark",
      status: "published",
      startsAt: "2026-11-14T20:00:00Z",
      endsAt: "2026-11-15T02:00:00Z",
      timezone: "Africa/Accra",
      venue: { name: "Alliance Française", city: "Accra" },
      placesTaken: 401,
      capacity: 500,
    },
    {
      id: "figma-nairobi",
      title: "Nairobi Frequency",
      status: "published",
      startsAt: "2026-11-21T17:00:00Z",
      endsAt: "2026-11-21T23:00:00Z",
      timezone: "Africa/Nairobi",
      venue: { name: "Ngong Racecourse", city: "Nairobi" },
      placesTaken: 912,
      capacity: 1200,
    },
  ];
  return { items, total: items.length };
}
