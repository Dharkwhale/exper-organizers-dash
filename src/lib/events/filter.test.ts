import { describe, expect, test } from "vitest";
import { cities, filterEvents } from "./filter";
import type { EventRow } from "./types";

const now = new Date("2026-11-06T12:00:00Z");

const row = (over: Partial<EventRow> & { id: string }): EventRow => ({
  title: `Event ${over.id}`,
  status: "published",
  startsAt: "2026-11-20T18:00:00Z",
  endsAt: "2026-11-20T23:00:00Z",
  venue: { name: null, city: null },
  coverImageUrl: null,
  timezone: "UTC",
  capacity: null,
  sold: null,
  currency: null,
  ...over,
});

const lagos = row({ id: "lagos", title: "Sound/Scape", venue: { name: "Landmark", city: "Lagos" } });
const accra = row({ id: "accra", title: "Accra After Dark", venue: { name: "Front/Back", city: "Accra" } });
const nowhere = row({ id: "nowhere", title: "Pop-up Lagos Night", venue: { name: null, city: null } });
const past = row({
  id: "past",
  startsAt: "2026-10-01T18:00:00Z",
  endsAt: "2026-10-01T23:00:00Z",
  venue: { name: null, city: "Lagos" },
});
const draft = row({ id: "draft", status: "draft", venue: { name: null, city: "Lagos" } });
const all = [lagos, accra, nowhere, past, draft];
const ids = (rows: EventRow[]) => rows.map((r) => r.id);
const q = (over: Partial<{ tab: "upcoming" | "live" | "past" | "drafts"; query: string; city: string | null }> = {}) => ({
  tab: "upcoming" as const,
  query: "",
  city: null,
  ...over,
});

describe("filterEvents", () => {
  test("the tab restricts the rows", () => {
    expect(ids(filterEvents(all, q({ tab: "past" }), now))).toEqual(["past"]);
    expect(ids(filterEvents(all, q({ tab: "drafts" }), now))).toEqual(["draft"]);
  });

  test("query is trimmed and case-insensitive, over title and city", () => {
    const found = filterEvents(all, q({ query: "  LAGOS " }), now);
    expect(ids(found).sort()).toEqual(["lagos", "nowhere"]);
  });

  test("a query made of regex characters matches nothing and does not throw", () => {
    expect(filterEvents(all, q({ query: "(" }), now)).toEqual([]);
  });

  test("the city filter keeps only that city", () => {
    expect(ids(filterEvents(all, q({ city: "Accra" }), now))).toEqual(["accra"]);
  });

  test("a row with no city survives an empty city filter, loses to a named one, and is still found by title", () => {
    expect(ids(filterEvents(all, q(), now))).toContain("nowhere");
    expect(ids(filterEvents(all, q({ city: "Lagos" }), now))).not.toContain("nowhere");
    expect(ids(filterEvents(all, q({ query: "pop-up" }), now))).toEqual(["nowhere"]);
  });

  test("results come back sorted for the tab", () => {
    const sooner = row({ id: "sooner", startsAt: "2026-11-08T10:00:00Z", endsAt: "2026-11-08T12:00:00Z" });
    expect(ids(filterEvents([lagos, sooner], q(), now))).toEqual(["sooner", "lagos"]);
  });
});

describe("cities", () => {
  test("returns sorted unique non-null cities", () => {
    expect(cities(all)).toEqual(["Accra", "Lagos"]);
  });
});
