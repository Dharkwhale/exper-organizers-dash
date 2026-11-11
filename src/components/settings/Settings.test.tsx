import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { Settings } from "./Settings";

describe("Settings", () => {
  test("shows the settings header and tabs", () => {
    render(<Settings />);
    expect(screen.getByRole("heading", { level: 1, name: "Settings" })).toBeInTheDocument();
    expect(
      screen.getByText("Workspace preferences, security and event defaults."),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Workspace" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: "Security" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Notifications" })).toBeInTheDocument();
  });

  test("shows organisation and event defaults", () => {
    render(<Settings />);
    expect(screen.getByRole("heading", { name: "Organisation" })).toBeInTheDocument();
    expect(screen.getByDisplayValue("Afterhours studio")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Afterhours Studio Ltd")).toBeInTheDocument();
    expect(screen.getByDisplayValue("hello@afterhours.studio")).toBeInTheDocument();
    expect(screen.getByDisplayValue("afterhours.studio/support")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save changes" })).toBeInTheDocument();

    expect(screen.getByRole("heading", { name: "Event defaults" })).toBeInTheDocument();
    expect(screen.getByText("Ask when creating each event")).toBeInTheDocument();
    expect(screen.getByText("Choose per event (IANA)")).toBeInTheDocument();
    expect(screen.getByText("Photo review")).toBeInTheDocument();
    expect(screen.getByText("Require approval before sharing")).toBeInTheDocument();
  });

  test("shows security, notifications and workspace controls", () => {
    render(<Settings />);
    expect(screen.getByRole("heading", { name: "Security" })).toBeInTheDocument();
    expect(screen.getByText("Two-step verification")).toBeInTheDocument();
    expect(screen.getByText("Review")).toBeInTheDocument();
    expect(screen.getByText("MacBook · Lagos · This device")).toBeInTheDocument();

    expect(
      screen.getByRole("heading", { name: "Notification delivery" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Daily summary")).toBeInTheDocument();
    expect(screen.getByText("Off")).toBeInTheDocument();

    expect(
      screen.getByRole("heading", { name: "Workspace controls" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Delete workspace/ }),
    ).toBeInTheDocument();
  });
});
