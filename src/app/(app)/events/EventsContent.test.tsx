import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import type { EventsData } from "@/lib/events/types";
import { EventsContent } from "./EventsContent";

const getEvents = vi.hoisted(() => vi.fn());
const redirect = vi.hoisted(() =>
  vi.fn((to: string) => {
    throw new Error(`REDIRECT:${to}`);
  }),
);

vi.mock("@/lib/server/events", () => ({ getEvents }));
vi.mock("next/navigation", () => ({ redirect }));

const data: EventsData = {
  nowIso: "2026-11-06T12:00:00Z",
  truncated: false,
  events: [
    {
      id: "e1",
      title: "Sound/Scape",
      status: "published",
      startsAt: "2026-11-21T18:00:00Z",
      endsAt: "2026-11-21T22:30:00Z",
      venue: { name: "Landmark Beach", city: "Lagos" },
      coverImageUrl: null,
      timezone: "Africa/Lagos",
      capacity: 900,
      sold: 683,
      currency: "NGN",
    },
  ],
};

beforeEach(() => {
  getEvents.mockReset();
  redirect.mockClear();
});

describe("EventsContent", () => {
  test("shows the page and the organiser's events when they load", async () => {
    getEvents.mockResolvedValue({ ok: true, data });
    render(await EventsContent());
    expect(screen.getByRole("heading", { level: 1, name: "Your events" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Sound/Scape" })).toBeInTheDocument();
  });

  test("sends a signed-out visitor to sign in", async () => {
    getEvents.mockResolvedValue({ ok: false, reason: "unauthorized", message: "Unauthorized" });
    await expect(EventsContent()).rejects.toThrow("REDIRECT:/sign-in");
  });

  test("explains a non-organizer account instead of looping", async () => {
    getEvents.mockResolvedValue({ ok: false, reason: "forbidden", message: "Forbidden" });
    render(await EventsContent());
    expect(screen.getByRole("alert")).toHaveTextContent("This account isn't an organizer.");
    expect(redirect).not.toHaveBeenCalled();
  });

  test("shows the failure and a way to try again", async () => {
    getEvents.mockResolvedValue({
      ok: false,
      reason: "error",
      message: "Couldn't reach the server. Try again.",
    });
    render(await EventsContent());
    expect(screen.getByRole("alert")).toHaveTextContent("Couldn't reach the server. Try again.");
    expect(screen.getByRole("link", { name: "Try again" })).toHaveAttribute("href", "/events");
  });
});
