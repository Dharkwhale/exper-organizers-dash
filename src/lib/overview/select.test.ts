import { describe, expect, test } from "vitest";
import { selectComingUp, selectHero } from "./select";
import type { EventSummary } from "./types";

const now = new Date("2026-10-25T21:00:00Z");

function event(
  id: string,
  startsAt: string,
  endsAt: string,
  status = "published",
): EventSummary {
  return { id, title: id, status, startsAt, endsAt, venue: { name: null, city: null } };
}

const live = event("live", "2026-10-25T19:00:00Z", "2026-10-26T02:30:00Z");
const soon = event("soon", "2026-10-31T18:00:00Z", "2026-10-31T23:00:00Z");
const later = event("later", "2026-11-06T18:30:00Z", "2026-11-06T23:00:00Z");

describe("selectHero", () => {
  test("picks a published event that is happening now as live", () => {
    expect(selectHero([soon, live], now)).toEqual({ mode: "live", event: live });
  });

  test("the earliest start wins between two live events", () => {
    const earlier = event("earlier", "2026-10-25T18:00:00Z", "2026-10-26T01:00:00Z");
    expect(selectHero([live, earlier], now)?.event.id).toBe("earlier");
  });

  test("falls back to the soonest upcoming event", () => {
    expect(selectHero([later, soon], now)).toEqual({ mode: "upcoming", event: soon });
  });

  test("ignores drafts, even when one is happening now", () => {
    const draft = event("draft", "2026-10-25T19:00:00Z", "2026-10-26T02:00:00Z", "draft");
    expect(selectHero([draft], now)).toBeNull();
    expect(selectHero([draft, soon], now)?.event.id).toBe("soon");
  });

  test("is null when there are no events", () => {
    expect(selectHero([], now)).toBeNull();
  });

  test("an event that already ended is not the hero", () => {
    const over = event("over", "2026-10-24T19:00:00Z", "2026-10-25T02:00:00Z");
    expect(selectHero([over], now)).toBeNull();
  });
});

describe("selectComingUp", () => {
  test("excludes the hero, drafts and past events, ascending", () => {
    const draft = event("draft", "2026-11-01T18:00:00Z", "2026-11-01T22:00:00Z", "draft");
    const over = event("over", "2026-10-20T18:00:00Z", "2026-10-20T22:00:00Z");
    const result = selectComingUp([later, draft, over, live, soon], "live", now);
    expect(result.items.map((e) => e.id)).toEqual(["soon", "later"]);
    expect(result.total).toBe(2);
  });

  test("caps the list at four while total reports every upcoming event", () => {
    const many = Array.from({ length: 6 }, (_, i) =>
      event(`e${i}`, `2026-11-0${i + 1}T18:00:00Z`, `2026-11-0${i + 1}T22:00:00Z`),
    );
    const result = selectComingUp(many, null, now);
    expect(result.items).toHaveLength(4);
    expect(result.total).toBe(6);
    expect(result.items[0].id).toBe("e0");
  });

  test("honours a custom limit", () => {
    const result = selectComingUp([soon, later], null, now, 1);
    expect(result.items.map((e) => e.id)).toEqual(["soon"]);
    expect(result.total).toBe(2);
  });
});
