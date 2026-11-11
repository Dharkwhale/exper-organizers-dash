import type { TeamData } from "./types";

/** Figma Team / Roles state for Afterhours studio. */
export function designTeam(): TeamData {
  return {
    eventMeta: "Give people the access they need, and nothing more.",
    memberCount: "6 members",
    members: [
      {
        id: "m1",
        name: "Tope Adewale",
        badges: ["You", "Owner"],
        detail: "tope@afterhours.studio · All events",
      },
      {
        id: "m2",
        name: "Kemi Adeyemi",
        badges: ["Moderator"],
        detail: "kemi@afterhours.studio · Neon Solstice",
      },
      {
        id: "m3",
        name: "Dami Adebayo",
        badges: ["Check-in"],
        detail: "dami@afterhours.studio · Neon Solstice",
      },
      {
        id: "m4",
        name: "Seyi Cole",
        badges: ["Finance"],
        detail: "seyi@afterhours.studio · All events",
      },
      {
        id: "m5",
        name: "Ama Mensah",
        badges: ["Live operator"],
        detail: "ama@afterhours.studio · Accra After Dark",
      },
      {
        id: "m6",
        name: "Leah Evans",
        badges: ["Editor"],
        detail: "leah@afterhours.studio · London events",
      },
      {
        id: "m7",
        name: "Nia Otieno",
        badges: ["Invite pending"],
        detail: "nia@afterhours.studio · Nairobi Frequency",
        resend: true,
      },
    ],
    role: "Live operator",
    eventAccess: "Selected events only",
    permissions: [
      {
        id: "p1",
        label: "Run prompts & reminders",
        allowed: true,
      },
      {
        id: "p2",
        label: "Pause / end live event",
        allowed: true,
        note: "Confirmation required for end",
      },
      {
        id: "p3",
        label: "View private squad scores",
        allowed: true,
      },
      {
        id: "p4",
        label: "Manage sales & payouts",
        allowed: false,
      },
      {
        id: "p5",
        label: "Manage team permissions",
        allowed: false,
      },
    ],
    roleKey:
      "Owner: full access. Editor: event setup. Moderator: photo and response review. Check-in: admission only. Finance: ledgers and transfers.",
  };
}
