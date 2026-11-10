import { describe, expect, test } from "vitest";
import {
  formatEventLine,
  formatEventWindow,
  formatLongDate,
  utcOffset,
  zoneLabel,
} from "./format";

const winter = new Date("2026-11-06T12:00:00Z");
const summer = new Date("2026-07-06T12:00:00Z");

describe("zoneLabel", () => {
  test("uses the African abbreviations", () => {
    expect(zoneLabel("Africa/Lagos", winter)).toBe("WAT");
    expect(zoneLabel("Africa/Nairobi", winter)).toBe("EAT");
    expect(zoneLabel("Africa/Accra", winter)).toBe("GMT");
  });

  test("London follows daylight saving", () => {
    expect(zoneLabel("Europe/London", winter)).toBe("GMT");
    expect(zoneLabel("Europe/London", summer)).toBe("BST");
  });

  test("an unknown zone falls back to UTC without throwing", () => {
    expect(zoneLabel("Mars/Base", winter)).toBe("UTC");
  });
});

describe("utcOffset", () => {
  test("writes the offset the way the hero badge shows it", () => {
    expect(utcOffset("Africa/Lagos", winter)).toBe("UTC+01:00");
    expect(utcOffset("Africa/Nairobi", winter)).toBe("UTC+03:00");
  });

  test("zero offset and unknown zones read as UTC+00:00", () => {
    expect(utcOffset("Africa/Accra", winter)).toBe("UTC+00:00");
    expect(utcOffset("Mars/Base", winter)).toBe("UTC+00:00");
  });
});

describe("formatEventWindow", () => {
  test("shows both dates for an event that spans midnight", () => {
    expect(
      formatEventWindow("2026-10-25T19:00:00Z", "2026-10-26T02:30:00Z", "Africa/Lagos"),
    ).toBe("25 Oct, 20:00 → 26 Oct, 03:30 WAT");
  });

  test("falls back to UTC for a zone Intl rejects", () => {
    expect(
      formatEventWindow("2026-10-25T19:00:00Z", "2026-10-26T02:30:00Z", "Mars/Base"),
    ).toBe("25 Oct, 19:00 → 26 Oct, 02:30 UTC");
  });
});

describe("formatEventLine", () => {
  test("joins date, time, venue and city", () => {
    expect(
      formatEventLine(
        {
          startsAt: "2026-10-31T18:00:00Z",
          venue: { name: "Terra Kulture", city: "Lagos" },
        },
        "Africa/Lagos",
      ),
    ).toBe("31 Oct · 19:00 WAT · Terra Kulture · Lagos");
  });

  test("skips a missing venue name", () => {
    expect(
      formatEventLine(
        { startsAt: "2026-10-31T18:00:00Z", venue: { name: null, city: "Lagos" } },
        "Africa/Lagos",
      ),
    ).toBe("31 Oct · 19:00 WAT · Lagos");
  });

  test("shows only the date and time when the venue is empty", () => {
    const line = formatEventLine(
      { startsAt: "2026-10-31T18:00:00Z", venue: { name: null, city: null } },
      "Africa/Lagos",
    );
    expect(line).toBe("31 Oct · 19:00 WAT");
    expect(line).not.toContain("null");
  });
});

describe("formatLongDate", () => {
  test("writes the weekday and full date", () => {
    expect(formatLongDate(new Date("2026-10-25T12:00:00Z"))).toBe(
      "Sunday, 25 October 2026",
    );
  });
});
