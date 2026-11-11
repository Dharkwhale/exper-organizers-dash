import type { LiveControlData } from "./types";

/** Figma Live Control state for Neon Solstice. */
export function designLiveControl(): LiveControlData {
  return {
    eventTitle: "Neon Solstice",
    eventMeta:
      "Landmark Beach, Lagos · 25 Oct 2026, 21:41 WAT · Africa/Lagos (UTC+01:00)",
    syncLabel: "Synced 2 sec ago",
    metrics: [
      { label: "Attendees", value: "1,240", detail: "registered people" },
      { label: "Checked in", value: "1,216", detail: "24 pending arrival" },
      {
        label: "Active participants",
        value: "876",
        detail: "last 5 minutes",
      },
      {
        label: "Prompt respondents",
        value: "38",
        detail: "4.3% of active attendees",
      },
    ],
    livePrompt: {
      indexLabel: "02 / 04",
      title: "What is the DJ actually doing up there?",
      detail: "Wrong answers only · Everyone checked in",
      remaining: "01:42",
      totalLabel: "of 03:00 remaining",
      answered: 38,
      active: 876,
      answeredPercent: "4.3%",
      remainingToAnswer: 838,
      footerNote:
        "838 yet to answer · One answer per person · Creative prompt, no correct answer",
      sendNextNote:
        "Sending next closes this prompt first. Attendees keep their submitted answers.",
    },
    responses: [
      {
        id: "r1",
        text: "Updating Windows. We're at 97%.",
        author: "Kemi",
        time: "21:41:08 WAT",
        laughs: 24,
      },
      {
        id: "r2",
        text: "Negotiating with the AUX cable.",
        author: "Dami",
        time: "21:41:02 WAT",
        laughs: 18,
      },
      {
        id: "r3",
        text: "Summoning the bass gods. Offerings accepted.",
        author: "Ada",
        time: "21:40:51 WAT",
        laughs: 31,
      },
      {
        id: "r4",
        text: "Pretending the playlist is intentional.",
        author: "Tunde",
        time: "21:40:44 WAT",
        laughs: 12,
        flagged: true,
      },
      {
        id: "r5",
        text: "Counting how many people are filming him.",
        author: "Sade",
        time: "21:40:18 WAT",
        laughs: 9,
        flagged: true,
      },
    ],
    queue: [
      {
        id: "q1",
        title: "Find Something Blue",
        status: "Ready",
        detail: "Up next · Photo mission · 05:00",
      },
      {
        id: "q2",
        title: "Write tonight's headline",
        status: "Ready",
        detail: "Private squad mission · 04:00",
      },
      {
        id: "q3",
        title: "One has to go",
        status: "240 votes",
        detail: "Sent at 21:30 WAT · Poll closed",
      },
    ],
    poll: {
      title: "One has to go",
      closedLabel: "Closed · 21:32",
      respondents: 240,
      options: [
        { label: "We should hang soon", percent: 55, votes: 132, emphasize: true },
        { label: "Voice notes", percent: 30, votes: 72 },
        { label: "Group chats", percent: 15, votes: 36 },
      ],
    },
    photo: {
      pending: 13,
      title: "The room, right now",
      author: "Ada · 21:39 WAT",
      consent: "Consent given · Waiting for review",
      imageUrl: "/overview/neon-solstice.jpg",
      approved: 157,
      pendingCount: 13,
      rejected: 4,
      submitted: 174,
    },
    participation: {
      active: 876,
      checkedIn: 1216,
      activePercent: "72.0%",
      inactiveCheckedIn: 340,
      registered: 1240,
      pendingArrival: 24,
      promptRespondents: 38,
      quizCorrectPercent: "72.1%",
      quizDetail: "Previous prompt · 240 respondents\n173 correct + 67 incorrect = 240",
    },
    roomFeel: {
      people: 312,
      series: [
        { label: "20:45", value: 1.2 },
        { label: "21:00", value: 2.1 },
        { label: "21:15", value: 3.6 },
        { label: "21:30", value: 4.2 },
        { label: "21:41", value: 4.9 },
      ],
      moods: [
        { label: "Electric", count: 173 },
        { label: "Calm", count: 68 },
        { label: "Curious", count: 71 },
      ],
    },
    leaderboard: [
      { name: "Femisola", points: 2480 },
      { name: "Julian Grey", points: 2120 },
      { name: "Elias Thorne", points: 1950 },
    ],
    squads: [
      {
        name: "Neon Nomads",
        points: 1340,
        detail: "8 members · 5 missions completed",
      },
      {
        name: "Lunar Drifters",
        points: 1185,
        detail: "6 members · 4 missions completed",
      },
      {
        name: "Solar Echoes",
        points: 1070,
        detail: "7 members · 4 missions completed",
      },
    ],
    arrivals: {
      checkedIn: 1216,
      checkedInPercent: "98.1%",
      registered: 1240,
      pending: 24,
      recent: [
        {
          name: "Ada Okafor",
          code: "NS-0428",
          status: "Admitted",
          meta: "21:38 WAT · General Access",
        },
        {
          name: "Kunle Bello",
          code: "NS-0831",
          status: "Admitted",
          meta: "21:37 WAT · Squad guest 2/4",
        },
      ],
    },
    reminders: [
      {
        id: "rm1",
        text: "Water stations are open",
        meta: "21:50 WAT · All checked-in attendees",
      },
      {
        id: "rm2",
        text: "Last entry at 23:00",
        meta: "22:30 WAT · 24 pending attendees",
      },
    ],
    incidents: [
      {
        id: "i1",
        title: "North entrance queue",
        action: "Assign",
        meta: "21:36 WAT · Dami · Open",
        detail: "Extra steward requested; no injury reported.",
      },
      {
        id: "i2",
        title: "Lost phone handed to welfare",
        action: "View",
        meta: "21:22 WAT · Kemi · Resolved at 21:29.",
        detail: "",
      },
    ],
  };
}
