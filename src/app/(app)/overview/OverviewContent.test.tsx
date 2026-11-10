import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { mockOverview } from "@/lib/overview/mock";
import type { Overview } from "@/lib/overview/types";
import { OverviewContent } from "./OverviewContent";

const getOverview = vi.hoisted(() => vi.fn());
const redirect = vi.hoisted(() =>
  vi.fn((to: string) => {
    throw new Error(`REDIRECT:${to}`);
  }),
);

vi.mock("@/lib/server/overview", () => ({ getOverview }));
vi.mock("next/navigation", () => ({ redirect }));

const summary = {
  id: "e1",
  title: "Neon Solstice",
  status: "published",
  startsAt: "2026-10-25T19:00:00Z",
  endsAt: "2026-10-26T02:30:00Z",
  venue: { name: "Landmark Beach", city: "Lagos" },
};

const full: Overview = {
  user: { fullName: "Tope Adewale", email: "tope@x.io" },
  workspaceName: "Afterhours studio",
  hero: {
    mode: "live",
    event: summary,
    detail: {
      ...summary,
      coverImageUrl: null,
      timezone: "Africa/Lagos",
      capacity: 1240,
      venue: { name: "Landmark Beach", city: "Lagos", address: "Victoria Island" },
    },
    checkedIn: 1216,
    attendees: 1240,
    checkedInCapped: false,
  },
  comingUp: {
    items: [
      {
        id: "e2",
        title: "Sound/Scape",
        status: "published",
        startsAt: "2026-10-31T18:00:00Z",
        endsAt: "2026-10-31T23:00:00Z",
        timezone: "Africa/Lagos",
        venue: { name: "Terra Kulture", city: "Lagos" },
      },
    ],
    total: 1,
  },
  mock: mockOverview(),
};

beforeEach(() => {
  getOverview.mockReset();
  redirect.mockClear();
});

describe("OverviewContent", () => {
  test("shows every section when the overview loads", async () => {
    getOverview.mockResolvedValue({ ok: true, data: full });
    render(await OverviewContent());
    expect(
      screen.getByRole("heading", { level: 1, name: "The night, in view." }),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Neon Solstice" })).toBeInTheDocument();
    expect(screen.getByText("Sound/Scape")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Tonight's room/ })).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Your attention, in order" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Team activity" })).toBeInTheDocument();
  });

  test("sends a signed-out visitor to sign in", async () => {
    getOverview.mockResolvedValue({
      ok: false,
      reason: "unauthorized",
      message: "Unauthorized",
    });
    await expect(OverviewContent()).rejects.toThrow("REDIRECT:/sign-in");
  });

  test("explains a non-organizer account instead of looping", async () => {
    getOverview.mockResolvedValue({
      ok: false,
      reason: "forbidden",
      message: "Forbidden",
    });
    render(await OverviewContent());
    expect(screen.getByRole("alert")).toHaveTextContent(
      "This account isn't an organizer.",
    );
    expect(redirect).not.toHaveBeenCalled();
  });

  test("shows the failure and a way to try again", async () => {
    getOverview.mockResolvedValue({
      ok: false,
      reason: "error",
      message: "Couldn't reach the server. Try again.",
    });
    render(await OverviewContent());
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Couldn't reach the server. Try again.",
    );
    expect(screen.getByRole("link", { name: "Try again" })).toHaveAttribute(
      "href",
      "/overview",
    );
  });

  test("with no live or upcoming event it says so and keeps the rest", async () => {
    getOverview.mockResolvedValue({
      ok: true,
      data: { ...full, hero: null, comingUp: { items: [], total: 0 } },
    });
    render(await OverviewContent());
    expect(screen.getByText("No live or upcoming events")).toBeInTheDocument();
    expect(screen.getByText("No upcoming events yet.")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Team activity" })).toBeInTheDocument();
  });
});
