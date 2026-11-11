import type { MomentsData } from "./types";

/** Figma Moments moderation state for Neon Solstice. */
export function designMoments(): MomentsData {
  return {
    eventMeta:
      "Neon Solstice · Review submissions before they appear in the room or event memory.",
    counts: {
      pending: 13,
      approved: 157,
      rejected: 4,
    },
    current: {
      caption: "The room feels like it's breathing.",
      authorMeta: "Ada Okafor · Neon Solstice · 21:39 WAT",
      imageUrl: "/overview/neon-solstice.jpg",
      submitter: "Ada Okafor",
      ticketMeta: "NS-0428 · Checked in · General Access",
      consent: "Granted",
      consentNote: "Attendee agreed to share in event memory.",
      screening: "No issue detected · Human review required.",
      actionNote:
        "Approval adds this photo to the shared event memory. Rejection stays private to moderators and the submitter.",
    },
    queue: [
      {
        id: "q1",
        name: "Kunle Bello",
        action: "Review",
        detail: "Find Something Blue · 21:39 WAT",
      },
      {
        id: "q2",
        name: "Kemi Adeyemi",
        action: "Review",
        detail: "Room moment · 21:40 WAT",
      },
      {
        id: "q3",
        name: "Bola Akande",
        action: "Review",
        detail: "Find Something Blue · 21:40 WAT",
      },
    ],
    queueFooter: "Showing 3 of 12 other pending submissions",
  };
}
