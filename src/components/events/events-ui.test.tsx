import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test } from "vitest";
import type { EventRow } from "@/lib/events/types";
import { EventsBrowser } from "./EventsBrowser";
import { EventsSkeleton } from "./EventsSkeleton";

const NOW = "2026-11-06T12:00:00Z";

const row = (over: Partial<EventRow> & { id: string; title: string }): EventRow => ({
  status: "published",
  startsAt: "2026-11-21T18:00:00Z",
  endsAt: "2026-11-21T22:30:00Z",
  venue: { name: null, city: null },
  coverImageUrl: null,
  timezone: "Africa/Lagos",
  capacity: null,
  sold: null,
  currency: null,
  ...over,
});

const lagos = row({
  id: "lagos",
  title: "Sound/Scape",
  venue: { name: "Landmark Beach", city: "Lagos" },
  capacity: 900,
  sold: 683,
  currency: "NGN",
  coverImageUrl: "https://img.test/c.jpg",
});
const accra = row({
  id: "accra",
  title: "Accra After Dark",
  startsAt: "2026-11-07T20:00:00Z",
  endsAt: "2026-11-08T02:00:00Z",
  timezone: "Africa/Accra",
  venue: { name: "Front/Back", city: "Accra" },
  capacity: 280,
  sold: 187,
  currency: "GHS",
});
const mystery = row({
  id: "mystery",
  title: "Mystery Event",
  startsAt: "2026-12-01T18:00:00Z",
  endsAt: "2026-12-01T20:00:00Z",
});
const live = row({
  id: "live",
  title: "Live Night",
  startsAt: "2026-11-06T10:00:00Z",
  endsAt: "2026-11-06T14:00:00Z",
  venue: { name: "Arena", city: "Lagos" },
});
const past = row({
  id: "past",
  title: "Old Gig",
  startsAt: "2026-10-01T18:00:00Z",
  endsAt: "2026-10-01T22:00:00Z",
  venue: { name: "Hall", city: "Accra" },
});
const draft = row({ id: "draft", title: "Draft Idea", status: "draft" });
const ALL = [lagos, accra, mystery, live, past, draft];

function renderBrowser(events: EventRow[] = ALL, truncated = false) {
  return render(<EventsBrowser events={events} nowIso={NOW} truncated={truncated} />);
}

const titles = () =>
  screen.queryAllByRole("heading", { level: 3 }).map((h) => h.textContent);

describe("EventsBrowser", () => {
  test("opens on Upcoming, soonest first, with a count", () => {
    renderBrowser();
    expect(titles()).toEqual(["Accra After Dark", "Sound/Scape", "Mystery Event"]);
    expect(screen.getByRole("button", { name: "Upcoming" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("heading", { name: /Upcoming events/ })).toBeInTheDocument();
    expect(screen.getByText("3 events")).toBeInTheDocument();
  });

  test("a single event is counted in the singular", async () => {
    const user = userEvent.setup();
    renderBrowser();
    await user.click(screen.getByRole("button", { name: "Live" }));
    expect(screen.getByText("1 event")).toBeInTheDocument();
  });

  test.each([
    ["Live", ["Live Night"]],
    ["Past", ["Old Gig"]],
    ["Drafts", ["Draft Idea"]],
  ])("the %s tab shows its own events", async (tab, expected) => {
    const user = userEvent.setup();
    renderBrowser();
    await user.click(screen.getByRole("button", { name: tab }));
    expect(titles()).toEqual(expected);
    expect(screen.getByRole("button", { name: tab })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: "Upcoming" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  test("searching narrows the list by name or city", async () => {
    const user = userEvent.setup();
    renderBrowser();
    await user.type(screen.getByLabelText("Search events"), "accra");
    expect(titles()).toEqual(["Accra After Dark"]);
  });

  test("the city filter narrows the list", async () => {
    const user = userEvent.setup();
    renderBrowser();
    await user.selectOptions(screen.getByLabelText("City"), "Lagos");
    expect(titles()).toEqual(["Sound/Scape"]);
  });

  test("the city options are the cities of the events", () => {
    renderBrowser();
    const options = within(screen.getByLabelText("City"))
      .getAllByRole("option")
      .map((o) => o.textContent);
    expect(options).toEqual(["All cities", "Accra", "Lagos"]);
  });

  test("search and city compose, and an empty result says so", async () => {
    const user = userEvent.setup();
    renderBrowser();
    await user.type(screen.getByLabelText("Search events"), "scape");
    await user.selectOptions(screen.getByLabelText("City"), "Accra");
    expect(titles()).toEqual([]);
    expect(screen.getByText("No events match your search.")).toBeInTheDocument();
  });

  test("an empty tab says so", async () => {
    const user = userEvent.setup();
    renderBrowser([lagos]);
    await user.click(screen.getByRole("button", { name: "Drafts" }));
    expect(screen.getByText("No draft events.")).toBeInTheDocument();
  });

  test("no events at all says so", () => {
    renderBrowser([]);
    expect(
      screen.getByText("No events yet. Events you create will show up here."),
    ).toBeInTheDocument();
  });

  test("the truncation notice shows only when there are more events", () => {
    const { unmount } = renderBrowser(ALL, true);
    expect(screen.getByText("Showing the 50 most recent events.")).toBeInTheDocument();
    unmount();
    renderBrowser(ALL, false);
    expect(screen.queryByText(/most recent events/)).not.toBeInTheDocument();
  });

  test("Create event, Calendar view and every Manage event are disabled placeholders", () => {
    renderBrowser();
    for (const name of ["Create event", "Calendar view"]) {
      expect(screen.getByRole("button", { name })).toHaveAttribute("aria-disabled", "true");
    }
    const manage = screen.getAllByRole("button", { name: "Manage event" });
    expect(manage).toHaveLength(3);
    for (const button of manage) expect(button).toHaveAttribute("aria-disabled", "true");
  });

  test("shows the page title, subtitle and timezone note", () => {
    renderBrowser();
    expect(screen.getByRole("heading", { level: 1, name: "Your events" })).toBeInTheDocument();
    expect(
      screen.getByText(
        "From the first idea to the last moment. All dates and times are local to the event.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Timezone changes are saved per event; attendee calendars use the selected IANA timezone.",
      ),
    ).toBeInTheDocument();
  });
});

describe("an event row", () => {
  const rowFor = (title: string) => {
    renderBrowser();
    return within(screen.getByRole("heading", { name: title }).closest("article")!);
  };

  test("shows place, date and time, zone, tickets and currency", () => {
    const view = rowFor("Sound/Scape");
    expect(view.getByText("Landmark Beach · Lagos")).toBeInTheDocument();
    expect(view.getByText("21 Nov 2026 · 19:00-23:30")).toBeInTheDocument();
    expect(view.getByText("Africa/Lagos · UTC+01:00")).toBeInTheDocument();
    expect(view.getByText("683 / 900")).toBeInTheDocument();
    expect(view.getByText("Event currency · NGN")).toBeInTheDocument();
  });

  test("marks an event that runs past midnight", () => {
    const view = rowFor("Accra After Dark");
    expect(view.getByText("7 Nov 2026 · 20:00-02:00 (+1 day)")).toBeInTheDocument();
  });

  test("an event with nothing known shows dashes and never the word null", () => {
    const view = rowFor("Mystery Event");
    expect(view.getByText("—")).toBeInTheDocument();
    expect(view.queryByText(/Event currency/)).not.toBeInTheDocument();
    expect(view.queryByText(/null|undefined/)).not.toBeInTheDocument();
    expect(view.getByText("Africa/Lagos · UTC+01:00")).toBeInTheDocument();
  });
});

describe("EventsSkeleton", () => {
  test("announces that it is loading", () => {
    render(<EventsSkeleton />);
    expect(screen.getByLabelText("Loading your events")).toHaveAttribute("aria-busy", "true");
  });
});
