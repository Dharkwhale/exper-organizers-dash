import type { MockOverview } from "./types";

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
