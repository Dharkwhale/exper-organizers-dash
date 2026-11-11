import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test } from "vitest";
import { ExperienceBuilder } from "./ExperienceBuilder";

describe("ExperienceBuilder", () => {
  test("shows the builder chrome, timeline and selected prompt editor", () => {
    render(<ExperienceBuilder />);
    expect(
      screen.getByRole("heading", { level: 1, name: "Experience Builder" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Neon Solstice · Run-of-show/)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Tonight's timeline/ })).toBeInTheDocument();
    expect(screen.getByText("4 prompts")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Ask the room" })).toBeInTheDocument();
    expect(
      screen.getByDisplayValue("What is the DJ actually doing up there?"),
    ).toBeInTheDocument();
    expect(screen.getByText("ATTENDEE APP · PREVIEW")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Post my wrong answer" }),
    ).toBeInTheDocument();
  });

  test("selecting another timeline item updates the editor and preview", async () => {
    const user = userEvent.setup();
    render(<ExperienceBuilder />);
    await user.click(screen.getByRole("button", { name: /Find Something Blue/ }));
    expect(screen.getByDisplayValue("Find Something Blue")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Upload my photo" })).toBeInTheDocument();
  });

  test("header actions stay disabled placeholders for now", () => {
    render(<ExperienceBuilder />);
    for (const name of ["Add prompt", "Import from event", "Save version", "Save prompt"]) {
      expect(screen.getByRole("button", { name })).toHaveAttribute(
        "aria-disabled",
        "true",
      );
    }
  });
});
