import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { sparklinePath } from "@/lib/overview/sparkline";
import type { ComingUpItem, MockOverview, Overview } from "@/lib/overview/types";
import { AttentionList } from "./AttentionList";
import { ComingUp } from "./ComingUp";
import { LiveEventCard } from "./LiveEventCard";
import { PageHeading } from "./PageHeading";
import { RoomPulse } from "./RoomPulse";
import { TeamActivity } from "./TeamActivity";

const summary = {
  id: "e1",
  title: "Neon Solstice",
  status: "published",
  startsAt: "2026-10-25T19:00:00Z",
  endsAt: "2026-10-26T02:30:00Z",
  venue: { name: "Landmark Beach", city: "Lagos" },
};

type Hero = NonNullable<Overview["hero"]>;

const liveHero: Hero = {
  mode: "live",
  event: summary,
  detail: {
    ...summary,
    coverImageUrl: "https://img.test/cover.jpg",
    timezone: "Africa/Lagos",
    capacity: 1240,
    venue: { name: "Landmark Beach", city: "Lagos", address: "Victoria Island" },
  },
  checkedIn: 1216,
  attendees: 1240,
  checkedInCapped: false,
};

describe("PageHeading", () => {
  test("shows the heading, today's date and the strapline", () => {
    render(<PageHeading now={new Date("2026-10-25T12:00:00Z")} />);
    expect(
      screen.getByRole("heading", { level: 1, name: "The night, in view." }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Sunday, 25 October 2026 · Your events, from first idea to last memory.",
      ),
    ).toBeInTheDocument();
  });

  test("Create event is present but disabled until it has somewhere to go", () => {
    render(<PageHeading now={new Date("2026-10-25T12:00:00Z")} />);
    expect(screen.getByRole("button", { name: "Create event" })).toHaveAttribute(
      "aria-disabled",
      "true",
    );
  });
});

describe("LiveEventCard", () => {
  test("shows a live event with its badge, title, window and venue", () => {
    render(<LiveEventCard hero={liveHero} activeNow={876} />);
    expect(screen.getByText("LIVE NOW · Africa/Lagos · UTC+01:00")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: "Neon Solstice" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("25 Oct, 20:00 → 26 Oct, 03:30 WAT"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Landmark Beach · Victoria Island, Lagos"),
    ).toBeInTheDocument();
  });

  test("shows the check-in and live-activity numbers", () => {
    render(<LiveEventCard hero={liveHero} activeNow={876} />);
    expect(screen.getByText("1,216")).toBeInTheDocument();
    expect(screen.getByText("checked in / 1,240 attendees")).toBeInTheDocument();
    expect(screen.getByText("876")).toBeInTheDocument();
    expect(screen.getByText("active in the last 5 minutes")).toBeInTheDocument();
  });

  test("Open Live Control and Check in guests are disabled for now", () => {
    render(<LiveEventCard hero={liveHero} activeNow={876} />);
    for (const name of ["Open Live Control", "Check in guests"]) {
      expect(screen.getByRole("button", { name })).toHaveAttribute(
        "aria-disabled",
        "true",
      );
    }
  });

  test("an upcoming event says UP NEXT and hides the live-activity number", () => {
    render(<LiveEventCard hero={{ ...liveHero, mode: "upcoming" }} activeNow={876} />);
    expect(screen.getByText("UP NEXT · Africa/Lagos · UTC+01:00")).toBeInTheDocument();
    expect(
      screen.queryByText("active in the last 5 minutes"),
    ).not.toBeInTheDocument();
  });

  test("zero attendees reads as 0, never NaN", () => {
    render(
      <LiveEventCard
        hero={{ ...liveHero, checkedIn: 0, attendees: 0 }}
        activeNow={0}
      />,
    );
    expect(screen.getByText("checked in / 0 attendees")).toBeInTheDocument();
    expect(document.body).not.toHaveTextContent("NaN");
  });

  test("a capped count is shown as a lower bound", () => {
    render(
      <LiveEventCard
        hero={{ ...liveHero, checkedIn: 1850, attendees: 3200, checkedInCapped: true }}
        activeNow={10}
      />,
    );
    expect(screen.getByText("1,850+")).toBeInTheDocument();
    expect(screen.getByText("checked in / 3,200 attendees")).toBeInTheDocument();
  });

  test("without a cover image there is a placeholder, not a broken image", () => {
    const { container } = render(
      <LiveEventCard
        hero={{ ...liveHero, detail: { ...liveHero.detail, coverImageUrl: null } }}
        activeNow={1}
      />,
    );
    expect(container.querySelector("img")).toBeNull();
    expect(container.querySelector("[data-cover-placeholder]")).not.toBeNull();
  });

  test("a venue with no name or address still reads cleanly", () => {
    render(
      <LiveEventCard
        hero={{
          ...liveHero,
          detail: {
            ...liveHero.detail,
            venue: { name: null, city: "Lagos", address: null },
          },
        }}
        activeNow={1}
      />,
    );
    expect(screen.getByText("Lagos")).toBeInTheDocument();
    expect(document.body).not.toHaveTextContent("null");
  });
});

const row = (id: string, title: string, startsAt: string, tz: string, name: string | null, city: string | null): ComingUpItem => ({
  id,
  title,
  status: "published",
  startsAt,
  endsAt: startsAt,
  timezone: tz,
  venue: { name, city },
});

describe("ComingUp", () => {
  const items = [
    row("a", "Sound/Scape", "2026-10-31T18:00:00Z", "Africa/Lagos", "Terra Kulture", "Lagos"),
    row("b", "Rooftop Sessions", "2026-11-06T18:30:00Z", "Europe/London", null, "London"),
  ];

  test("lists each event with its own local time and zone", () => {
    render(<ComingUp items={items} total={2} />);
    expect(screen.getByText("Sound/Scape")).toBeInTheDocument();
    expect(
      screen.getByText("31 Oct · 19:00 WAT · Terra Kulture · Lagos"),
    ).toBeInTheDocument();
    expect(screen.getByText("Rooftop Sessions")).toBeInTheDocument();
    expect(screen.getByText("6 Nov · 18:30 GMT · London")).toBeInTheDocument();
  });

  test("the header counts every upcoming event, singular or plural", () => {
    const { rerender } = render(<ComingUp items={items} total={6} />);
    expect(screen.getByText("6 events")).toBeInTheDocument();
    rerender(<ComingUp items={items.slice(0, 1)} total={1} />);
    expect(screen.getByText("1 event")).toBeInTheDocument();
  });

  test("Manage is shown but disabled", () => {
    render(<ComingUp items={items} total={2} />);
    for (const el of screen.getAllByText(/Manage/)) {
      expect(el).toHaveAttribute("aria-disabled", "true");
    }
  });

  test("says so when there is nothing coming up", () => {
    render(<ComingUp items={[]} total={0} />);
    expect(screen.getByText("No upcoming events yet.")).toBeInTheDocument();
    expect(screen.queryByText("0 events")).not.toBeInTheDocument();
  });
});

const room: MockOverview["room"] = {
  mood: "High energy",
  reactions: 312,
  series: [
    { label: "20:45", value: 1 },
    { label: "20:50", value: 3 },
    { label: "20:55", value: 2 },
    { label: "21:00", value: 5 },
    { label: "21:05", value: 4 },
    { label: "21:10", value: 6 },
    { label: "21:41", value: 5 },
  ],
};

describe("RoomPulse", () => {
  test("draws the series as a line and labels the ends of the time axis", () => {
    const { container } = render(<RoomPulse room={room} />);
    const svg = container.querySelector("svg")!;
    const [, , width, height] = svg.getAttribute("viewBox")!.split(" ").map(Number);
    const path = svg.querySelector("path[data-series]")!;
    expect(path.getAttribute("d")).toBe(
      sparklinePath(room.series.map((p) => p.value), width, height),
    );
    expect(screen.getByText("20:45")).toBeInTheDocument();
    expect(screen.getByText("21:41")).toBeInTheDocument();
  });

  test("shows the mood, reaction count and the honest footnote", () => {
    render(<RoomPulse room={room} />);
    expect(screen.getByText("High energy")).toBeInTheDocument();
    expect(screen.getByText("312 reactions · 5-min intervals")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Electric is the most selected feeling. Based on 312 attendees, not the full room.",
      ),
    ).toBeInTheDocument();
  });

  test("with too little data it says so instead of drawing nothing", () => {
    const { container } = render(
      <RoomPulse room={{ ...room, series: [{ label: "20:45", value: 1 }] }} />,
    );
    expect(container.querySelector("path[data-series]")).toBeNull();
    expect(screen.getByText("No reactions yet.")).toBeInTheDocument();
  });
});

describe("AttentionList", () => {
  const items = [
    { title: "Art X is still a draft", detail: "Berlin · Venue and access need review", action: "Continue" },
    { title: "13 moments waiting for review", detail: "Neon Solstice · Oldest submission 2 min ago", action: "Review" },
  ];

  test("lists each item with its detail and a disabled action", () => {
    render(<AttentionList items={items} />);
    expect(
      screen.getByRole("heading", { name: "Your attention, in order" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Art X is still a draft")).toBeInTheDocument();
    expect(
      screen.getByText("Berlin · Venue and access need review"),
    ).toBeInTheDocument();
    expect(screen.getByText(/Continue/)).toHaveAttribute("aria-disabled", "true");
    expect(screen.getByText(/Review/)).toHaveAttribute("aria-disabled", "true");
  });

  test("says so when nothing needs attention", () => {
    render(<AttentionList items={[]} />);
    expect(screen.getByText("Nothing needs you right now.")).toBeInTheDocument();
  });
});

describe("TeamActivity", () => {
  test("lists what the team did and when", () => {
    render(
      <TeamActivity
        items={[{ text: "Kemi approved 8 photos", meta: "21:39 WAT · Moments" }]}
      />,
    );
    expect(screen.getByRole("heading", { name: "Team activity" })).toBeInTheDocument();
    expect(screen.getByText("Kemi approved 8 photos")).toBeInTheDocument();
    expect(screen.getByText("21:39 WAT · Moments")).toBeInTheDocument();
  });

  test("says so when there is no activity", () => {
    render(<TeamActivity items={[]} />);
    expect(screen.getByText("No activity yet.")).toBeInTheDocument();
  });
});
