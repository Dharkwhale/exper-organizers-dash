import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { ShellSkeleton } from "./ShellSkeleton";

describe("ShellSkeleton", () => {
  test("announces that the workspace is loading", () => {
    render(<ShellSkeleton />);
    const status = screen.getByRole("status", { name: "Loading your workspace" });
    expect(status).toHaveAttribute("aria-busy", "true");
  });

  test("shows the real navigation so the frame is there straight away", () => {
    render(<ShellSkeleton />);
    for (const label of [
      "Overview",
      "Events",
      "Experience Builder",
      "Live Control",
      "Attendees",
      "Sales",

      "Moments",
      "Reports",
      "Payouts",
      "Team / Roles",
      "Settings",
    ]) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
    expect(screen.getByText("EXPER")).toBeInTheDocument();
  });

  test("offers nothing to click while it loads", () => {
    render(<ShellSkeleton />);
    expect(screen.queryAllByRole("link")).toHaveLength(0);
    expect(screen.queryAllByRole("button")).toHaveLength(0);
  });

  test("holds a place for the names that haven't arrived, instead of showing null", () => {
    const { container } = render(<ShellSkeleton />);
    expect(container.querySelectorAll("[data-skeleton-name]").length).toBeGreaterThanOrEqual(3);
    expect(document.body).not.toHaveTextContent("null");
  });
});
