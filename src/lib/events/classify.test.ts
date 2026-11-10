import { describe, expect, test } from "vitest";
import { sortFor, tabFor } from "./classify";
import type { EventRow } from "./types";

const START = "2026-11-10T18:00:00Z";
const END = "2026-11-10T23:00:00Z";

const row = (over: Partial<EventRow> & { id: string }): EventRow => ({
  title: `Event ${over.id}`,
  status: "published",
  startsAt: START,
  endsAt: END,
  venue: { name: null, city: null },
  coverImageUrl: null,
  timezone: "UTC",
  capacity: null,
  sold: null,
  currency: null,
  ...over,
});

describe("tabFor", () => {
  test("a draft is a draft even when its start date has passed", () => {
    const now = new Date("2026-12-01T00:00:00Z");
    expect(tabFor({ status: "draft", startsAt: START, endsAt: END }, now)).toBe("drafts");
  });

  test("published and not yet started is upcoming", () => {
    const now = new Date("2026-11-10T17:59:59Z");
    expect(tabFor({ status: "published", startsAt: START, endsAt: END }, now)).toBe("upcoming");
  });

  test("is live exactly at the start", () => {
    const now = new Date(START);
    expect(tabFor({ status: "published", startsAt: START, endsAt: END }, now)).toBe("live");
  });

  test("is live exactly at the end", () => {
    const now = new Date(END);
    expect(tabFor({ status: "published", startsAt: START, endsAt: END }, now)).toBe("live");
  });

  test("is past once the end has gone by", () => {
    const now = new Date("2026-11-10T23:00:01Z");
    expect(tabFor({ status: "published", startsAt: START, endsAt: END }, now)).toBe("past");
  });
});

describe("sortFor", () => {
  const a = row({ id: "a", startsAt: "2026-11-01T10:00:00Z" });
  const b = row({ id: "b", startsAt: "2026-11-05T10:00:00Z" });
  const c = row({ id: "c", startsAt: "2026-11-03T10:00:00Z" });
  const ids = (rows: EventRow[]) => rows.map((r) => r.id);

  test("upcoming runs soonest first", () => {
    expect(ids(sortFor("upcoming", [b, a, c]))).toEqual(["a", "c", "b"]);
  });

  test("past runs most recent first", () => {
    expect(ids(sortFor("past", [a, b, c]))).toEqual(["b", "c", "a"]);
  });

  test("live and drafts run by start ascending", () => {
    expect(ids(sortFor("live", [b, a, c]))).toEqual(["a", "c", "b"]);
    expect(ids(sortFor("drafts", [b, a, c]))).toEqual(["a", "c", "b"]);
  });

  test("returns a new array and leaves the input alone", () => {
    const input = [b, a];
    const out = sortFor("upcoming", input);
    expect(out).not.toBe(input);
    expect(ids(input)).toEqual(["b", "a"]);
  });
});
