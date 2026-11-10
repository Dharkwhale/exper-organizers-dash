import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { getEvents, MAX_EVENTS } from "./events";

const jar = vi.hoisted(() => new Map<string, string>());

vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) =>
      jar.has(name) ? { name, value: jar.get(name) } : undefined,
  }),
}));

const now = new Date("2026-11-06T12:00:00Z");

const summary = (id: string) => ({
  id,
  title: `Event ${id}`,
  status: "published",
  startsAt: "2026-11-20T18:00:00Z",
  endsAt: "2026-11-20T23:00:00Z",
  venue: { name: "Landmark Beach", city: "Lagos" },
});

const detail = (over: Record<string, unknown> = {}) => ({
  coverImageUrl: "https://img.test/cover.jpg",
  timezone: "Africa/Lagos",
  capacity: 900,
  ticketTypes: [{ price: { amount: 5000, currency: "NGN" } }],
  ...over,
});

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });

type Routes = {
  list?: () => Response;
  detail?: (id: string) => Response;
  guests?: (id: string, url: URL) => Response;
};

let calls: { url: URL; authorization: string | null }[];

function stubBackend(routes: Routes = {}) {
  calls = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: string, init?: RequestInit) => {
      const url = new URL(input);
      const headers = new Headers(init?.headers);
      calls.push({ url, authorization: headers.get("authorization") });
      const path = url.pathname.replace("/api/v1", "");
      if (path === "/organizer/experiences") {
        return (routes.list ?? (() => json({ data: [summary("a"), summary("b")] })))();
      }
      const match = path.match(/^\/organizer\/experiences\/([^/]+)(\/guests)?$/);
      if (match && match[2]) {
        return (routes.guests ?? (() => json({ data: [], total: 683 })))(match[1], url);
      }
      if (match) return (routes.detail ?? (() => json(detail())))(match[1]);
      return json({ message: "not found" }, 404);
    }),
  );
}

beforeEach(() => {
  process.env.BACKEND_URL = "http://api.test";
  jar.clear();
  jar.set("exper_at", "tok-123");
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("getEvents", () => {
  test("is unauthorized without a session cookie and never calls the backend", async () => {
    jar.clear();
    stubBackend();
    expect(await getEvents(now)).toMatchObject({ ok: false, reason: "unauthorized" });
    expect(calls).toHaveLength(0);
  });

  test.each([
    [401, "unauthorized"],
    [403, "forbidden"],
    [500, "error"],
  ])("a %i from the list is %s", async (status, reason) => {
    stubBackend({ list: () => json({ message: "nope" }, status) });
    expect(await getEvents(now)).toMatchObject({ ok: false, reason });
  });

  test("an error carries the backend's message", async () => {
    stubBackend({ list: () => json({ message: "database down" }, 500) });
    expect(await getEvents(now)).toMatchObject({ message: "database down" });
  });

  test("fills each row from its detail and guest total, as the signed-in person", async () => {
    stubBackend();
    const result = await getEvents(now);
    if (!result.ok) throw new Error("expected ok");
    expect(result.data.nowIso).toBe(now.toISOString());
    expect(result.data.truncated).toBe(false);
    expect(result.data.events[0]).toEqual({
      ...summary("a"),
      coverImageUrl: "https://img.test/cover.jpg",
      timezone: "Africa/Lagos",
      capacity: 900,
      sold: 683,
      currency: "NGN",
    });
    const guestCalls = calls.filter((c) => c.url.pathname.endsWith("/guests"));
    expect(guestCalls).toHaveLength(2);
    expect(guestCalls[0].url.searchParams.get("limit")).toBe("1");
    expect(calls.every((c) => c.authorization === "Bearer tok-123")).toBe(true);
  });

  test("a failed detail keeps the row with fallbacks and its sold count", async () => {
    stubBackend({
      detail: (id) => (id === "a" ? json({ message: "x" }, 500) : json(detail())),
    });
    const result = await getEvents(now);
    if (!result.ok) throw new Error("expected ok");
    const [a, b] = result.data.events;
    expect(a).toMatchObject({
      timezone: "UTC",
      coverImageUrl: null,
      capacity: null,
      currency: null,
      sold: 683,
    });
    expect(b).toMatchObject({ timezone: "Africa/Lagos", currency: "NGN" });
  });

  test("a failed guest count leaves sold empty and the detail intact", async () => {
    stubBackend({ guests: () => json({ message: "x" }, 500) });
    const result = await getEvents(now);
    if (!result.ok) throw new Error("expected ok");
    expect(result.data.events[0]).toMatchObject({
      sold: null,
      timezone: "Africa/Lagos",
      capacity: 900,
    });
  });

  test("an event with no ticket types has no currency", async () => {
    stubBackend({ detail: () => json(detail({ ticketTypes: [] })) });
    const result = await getEvents(now);
    if (!result.ok) throw new Error("expected ok");
    expect(result.data.events[0].currency).toBeNull();
  });

  test("passes an unknown timezone through for the formatters to guard", async () => {
    stubBackend({ detail: () => json(detail({ timezone: "Not/AZone" })) });
    const result = await getEvents(now);
    if (!result.ok) throw new Error("expected ok");
    expect(result.data.events[0].timezone).toBe("Not/AZone");
  });

  test("keeps the first 50 events and says so when there are more", async () => {
    const many = Array.from({ length: 55 }, (_, i) => summary(`e${i}`));
    stubBackend({ list: () => json({ data: many }) });
    const result = await getEvents(now);
    if (!result.ok) throw new Error("expected ok");
    expect(MAX_EVENTS).toBe(50);
    expect(result.data.events).toHaveLength(50);
    expect(result.data.events[0].id).toBe("e0");
    expect(result.data.events[49].id).toBe("e49");
    expect(result.data.truncated).toBe(true);
  });

  test("exactly 50 events is not truncated", async () => {
    const fifty = Array.from({ length: 50 }, (_, i) => summary(`e${i}`));
    stubBackend({ list: () => json({ data: fifty }) });
    const result = await getEvents(now);
    if (!result.ok) throw new Error("expected ok");
    expect(result.data.truncated).toBe(false);
  });
});
