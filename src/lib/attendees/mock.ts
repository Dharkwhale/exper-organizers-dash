import type { AttendeesData } from "./types";

/** Figma Attendees / Check-in state for Neon Solstice. */
export function designAttendees(): AttendeesData {
  return {
    eventMeta: "Neon Solstice · Main entrance · Africa/Lagos · 25 Oct 2024",
    metrics: [
      { label: "Attendees", value: "1,240", detail: "registered people" },
      { label: "Checked In", value: "1,216", detail: "people admitted" },
      { label: "Pending", value: "24", detail: "not yet admitted" },
    ],
    totals: {
      all: 1240,
      pending: 24,
      checkedIn: 1216,
    },
    guests: [
      {
        id: "g1",
        name: "Ada Okafor",
        status: "checked-in",
        checkedInAt: "21:38",
        ticket: "General Access · NS-0428",
      },
      {
        id: "g2",
        name: "Dami Adebayo",
        status: "pending",
        ticket: "VIP · Soundscape · NS-0529",
      },
      {
        id: "g3",
        name: "Kemi Adeyemi",
        status: "checked-in",
        checkedInAt: "21:14",
        ticket: "General Access · NS-0217",
      },
      {
        id: "g4",
        name: "Bola Akande",
        status: "pending",
        ticket: "General Access · NS-0618",
      },
      {
        id: "g5",
        name: "Kunle Bello",
        status: "checked-in",
        checkedInAt: "21:38",
        ticket: "Squad guest 2 / 4 · NS-0831",
      },
      {
        id: "g6",
        name: "Nosa Eghosa",
        status: "checked-in",
        checkedInAt: "21:12",
        ticket: "General Access · NS-0934",
      },
    ],
    page: 1,
    pageCount: 207,
    showing: 6,
    footnote:
      "Counts are people, not orders. Each squad guest has a unique QR code and one admission.",
  };
}
