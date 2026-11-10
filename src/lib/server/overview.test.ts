import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { countCheckIns, getOverview, getShellIdentity } from "./overview";

const jar = vi.hoisted(() => new Map<string, string>());

vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) =>
      jar.has(name) ? { name, value: jar.get(name) } : undefined,
  }),
}));

const now = new Date("2026-10-25T21:00:00Z");

const summary = (id: string, startsAt: string, endsAt: string) => ({
  id,
  title: `Event ${id}`,
  status: "published",
  startsAt,
  endsAt,
  venue: { name: "Landmark Beach", city: "Lagos" },
});

const me = {
  user: { id: "u1", email: "tope@x.io", fullName: "Tope Adewale" },
  roles: ["organizer"],
  isAdmin: false,
  workspace: { id: "w1", name: "Afterhours studio" },
  data: [
    summary("live", "2026-10-25T19:00:00Z", "2026-10-26T02:30:00Z"),
    summary("up1", "2026-10-31T18:00:00Z", "2026-10-31T23:00:00Z"),
    summary("up2", "2026-11-06T18:30:00Z", "2026-11-06T23:00:00Z"),
  ],
};

const detail = {
  ...summary("live", "2026-10-25T19:00:00Z", "2026-10-26T02:30:00Z"),
  coverImageUrl: "https://img.test/cover.jpg",
  timezone: "Africa/Lagos",
  capacity: 1240,
  venue: { name: "Landmark Beach", address: "Victoria Island", city: "Lagos" },
};

// Guest number `i` (0-based, across all pages) is checked in when i % 3 === 0.
function guestPage(url: URL, total: number) {
  const page = Number(url.searchParams.get("page"));
  const limit = Number(url.searchParams.get("limit"));
  const from = (page - 1) * limit;
  const count = Math.max(Math.min(limit, total - from), 0);
  return {
    data: Array.from({ length: count }, (_, k) => ({
      passId: `p${from + k}`,
      checkedInAt: (from + k) % 3 === 0 ? "2026-10-25T20:00:00Z" : null,
    })),
    page,
    limit,
    total,
    hasMore: from + count < total,
  };
}

type Routes = {
  me?: () => Response;
  detail?: (experienceId: string) => Response;
  guests?: (url: URL) => Response;
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });

let calls: { url: URL; authorization: string | null }[];

function stubBackend(routes: Routes) {
  calls = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: string, init?: RequestInit) => {
      const url = new URL(input);
      const headers = new Headers(init?.headers);
      calls.push({ url, authorization: headers.get("authorization") });
      const path = url.pathname.replace("/api/v1", "");
      if (path === "/organizer/me") return (routes.me ?? (() => json(me)))();
      if (path.endsWith("/guests")) {
        return (routes.guests ?? ((u) => json(guestPage(u, 3))))(url);
      }
      if (path.startsWith("/organizer/experiences/")) {
        const experienceId = path.split("/")[3];
        return (routes.detail ?? (() => json(detail)))(experienceId);
      }
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

describe("getOverview", () => {
  test("is unauthorized without a session cookie and never calls the backend", async () => {
    jar.clear();
    stubBackend({});
    const result = await getOverview(now);
    expect(result).toMatchObject({ ok: false, reason: "unauthorized" });
    expect(calls).toHaveLength(0);
  });

  test("assembles the overview from the backend and the mock", async () => {
    stubBackend({});
    const result = await getOverview(now);
    if (!result.ok) throw new Error("expected ok");
    const { data } = result;
    expect(data.workspaceName).toBe("Afterhours studio");
    expect(data.user).toEqual({ fullName: "Tope Adewale", email: "tope@x.io" });
    expect(data.hero?.mode).toBe("live");
    expect(data.hero?.detail.timezone).toBe("Africa/Lagos");
    expect(data.hero?.detail.capacity).toBe(1240);
    expect(data.hero?.attendees).toBe(3);
    expect(data.hero?.checkedIn).toBe(1);
    expect(data.comingUp.total).toBe(2);
    expect(data.comingUp.items.map((e) => e.id)).toEqual(["up1", "up2"]);
    expect(data.mock.room.reactions).toBe(312);
  });

  test("sends the access token as a bearer header", async () => {
    stubBackend({});
    await getOverview(now);
    expect(calls.length).toBeGreaterThan(0);
    expect(calls.every((c) => c.authorization === "Bearer tok-123")).toBe(true);
  });

  test("maps 401 to unauthorized and 403 to forbidden", async () => {
    stubBackend({ me: () => json({ message: "Unauthorized" }, 401) });
    expect(await getOverview(now)).toMatchObject({ ok: false, reason: "unauthorized" });
    stubBackend({ me: () => json({ message: "Not an organizer" }, 403) });
    expect(await getOverview(now)).toMatchObject({ ok: false, reason: "forbidden" });
  });

  test("maps other failures to an error with the backend message", async () => {
    stubBackend({ me: () => json({ message: "Database down" }, 500) });
    expect(await getOverview(now)).toEqual({
      ok: false,
      reason: "error",
      message: "Database down",
    });
  });

  test("with nothing live or upcoming there is no hero and no extra requests", async () => {
    stubBackend({ me: () => json({ ...me, data: [] }) });
    const result = await getOverview(now);
    if (!result.ok) throw new Error("expected ok");
    expect(result.data.hero).toBeNull();
    expect(result.data.comingUp).toEqual({ items: [], total: 0 });
    expect(calls).toHaveLength(1);
  });

  test("a user without a workspace still gets an overview", async () => {
    stubBackend({ me: () => json({ ...me, workspace: null }) });
    const result = await getOverview(now);
    if (!result.ok) throw new Error("expected ok");
    expect(result.data.workspaceName).toBeNull();
  });

  test("each coming-up event carries its own timezone, falling back to UTC", async () => {
    stubBackend({
      detail: (id) =>
        id === "up1"
          ? json({ ...detail, id, timezone: "Europe/London" })
          : id === "live"
            ? json(detail)
            : json({ message: "boom" }, 500),
    });
    const result = await getOverview(now);
    if (!result.ok) throw new Error("expected ok");
    const zones = Object.fromEntries(
      result.data.comingUp.items.map((e) => [e.id, e.timezone]),
    );
    expect(zones).toEqual({ up1: "Europe/London", up2: "UTC" });
  });

  test("keeps the hero when the detail and guest calls fail", async () => {
    stubBackend({
      detail: () => json({ message: "boom" }, 500),
      guests: () => json({ message: "boom" }, 500),
    });
    const result = await getOverview(now);
    if (!result.ok) throw new Error("expected ok");
    const hero = result.data.hero;
    expect(hero?.event.id).toBe("live");
    expect(hero?.detail).toMatchObject({
      timezone: "UTC",
      capacity: null,
      coverImageUrl: null,
    });
    expect(hero?.checkedIn).toBe(0);
    expect(hero?.attendees).toBe(0);
  });
});

describe("countCheckIns", () => {
  test("pages through every guest and counts the checked-in ones", async () => {
    stubBackend({ guests: (u) => json(guestPage(u, 120)) });
    const result = await countCheckIns("live", "tok-123");
    expect(result).toEqual({ checkedIn: 40, attendees: 120, capped: false });
    const pages = calls.map((c) => c.url.searchParams.get("page")).sort();
    expect(pages).toEqual(["1", "2", "3"]);
    expect(calls.every((c) => c.url.searchParams.get("limit") === "50")).toBe(true);
  });

  test("stops at forty pages and says the count is capped", async () => {
    stubBackend({ guests: (u) => json(guestPage(u, 3000)) });
    const result = await countCheckIns("live", "tok-123");
    expect(calls).toHaveLength(40);
    expect(result.capped).toBe(true);
    expect(result.attendees).toBe(3000);
  });
});

describe("getShellIdentity", () => {
  test("is unauthorized without a session cookie", async () => {
    jar.clear();
    stubBackend({});
    expect(await getShellIdentity()).toMatchObject({ ok: false, reason: "unauthorized" });
  });

  test("returns the workspace and user names", async () => {
    stubBackend({});
    expect(await getShellIdentity()).toEqual({
      ok: true,
      data: { workspaceName: "Afterhours studio", userName: "Tope Adewale" },
    });
  });

  test("falls back to the email when the user has no name", async () => {
    stubBackend({
      me: () => json({ ...me, user: { ...me.user, fullName: null } }),
    });
    expect(await getShellIdentity()).toMatchObject({
      ok: true,
      data: { userName: "tope@x.io" },
    });
  });
});
