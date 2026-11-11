import { describe, expect, test } from "vitest";
import { formatEventRange } from "./format";

describe("formatEventRange", () => {
  test("shows the date once with the start and end times in the event's zone", () => {
    expect(
      formatEventRange("2026-10-31T18:00:00Z", "2026-10-31T22:30:00Z", "Africa/Lagos"),
    ).toBe("31 Oct 2026 · 19:00 - 23:30");
  });

  test("marks an event that ends the next local day", () => {
    expect(
      formatEventRange("2026-11-07T20:00:00Z", "2026-11-08T02:00:00Z", "Africa/Accra"),
    ).toBe("7 Nov 2026 · 20:00 - 02:00 (+1 day)");
  });

  test("pluralises a longer span", () => {
    expect(
      formatEventRange("2026-11-07T20:00:00Z", "2026-11-09T02:00:00Z", "UTC"),
    ).toBe("7 Nov 2026 · 20:00 - 02:00 (+2 days)");
  });

  test("an unknown zone falls back to UTC instead of throwing", () => {
    expect(
      formatEventRange("2026-11-07T20:00:00Z", "2026-11-07T22:00:00Z", "Not/AZone"),
    ).toBe("7 Nov 2026 · 20:00 - 22:00");
  });

  test("the day count follows the event's zone, not UTC", () => {
    // 23:00Z to 00:30Z the next UTC day is 00:00 to 01:30 the same day in Lagos.
    expect(
      formatEventRange("2026-11-07T23:00:00Z", "2026-11-08T00:30:00Z", "Africa/Lagos"),
    ).toBe("8 Nov 2026 · 00:00 - 01:30");
  });
});
