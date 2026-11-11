import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { Moments } from "./Moments";

describe("Moments", () => {
  test("shows the moderation header and status tabs", () => {
    render(<Moments />);
    expect(
      screen.getByRole("heading", { level: 1, name: "Moments moderation" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Neon Solstice · Review submissions before they appear in the room or event memory.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Pending 13" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: "Approved 157" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Rejected 4" })).toBeInTheDocument();
  });

  test("shows the current submission, actions and details", () => {
    render(<Moments />);
    expect(
      screen.getByText("The room feels like it's breathing."),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Ada Okafor · Neon Solstice · 21:39 WAT"),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Approve photo/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Reject…/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Skip for now" })).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Submission details" }),
    ).toBeInTheDocument();
    expect(screen.getByText("NS-0428 · Checked in · General Access")).toBeInTheDocument();
    expect(screen.getByText("Granted")).toBeInTheDocument();
    expect(
      screen.getByText("No issue detected · Human review required."),
    ).toBeInTheDocument();
    expect(screen.getByText("Rejection reason")).toBeInTheDocument();
  });

  test("shows the up-next queue", () => {
    render(<Moments />);
    expect(screen.getByRole("heading", { name: /Up next/ })).toBeInTheDocument();
    expect(screen.getByText("/ Oldest first")).toBeInTheDocument();
    expect(screen.getByText(/Kunle Bello/)).toBeInTheDocument();
    expect(screen.getByText("Find Something Blue · 21:39 WAT")).toBeInTheDocument();
    expect(screen.getByText(/Kemi Adeyemi/)).toBeInTheDocument();
    expect(screen.getByText(/Bola Akande/)).toBeInTheDocument();
    expect(
      screen.getByText("Showing 3 of 12 other pending submissions"),
    ).toBeInTheDocument();
  });
});
