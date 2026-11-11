import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { OverviewSkeleton } from "./OverviewSkeleton";

describe("OverviewSkeleton", () => {
  test("announces that the overview is loading", () => {
    render(<OverviewSkeleton />);
    expect(
      screen.getByRole("status", { name: "Loading your overview" }),
    ).toHaveAttribute("aria-busy", "true");
  });
});
