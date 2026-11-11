import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { TeamRoles } from "./TeamRoles";

describe("TeamRoles", () => {
  test("shows the team header and actions", () => {
    render(<TeamRoles />);
    expect(
      screen.getByRole("heading", { level: 1, name: "Team / Roles" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Give people the access they need, and nothing more."),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Invite teammate/ }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "View audit log" })).toBeInTheDocument();
  });

  test("lists workspace team members", () => {
    render(<TeamRoles />);
    expect(screen.getByRole("heading", { name: /Workspace team/ })).toBeInTheDocument();
    expect(screen.getByText("/ 6 members")).toBeInTheDocument();
    expect(screen.getByText(/Tope Adewale/)).toBeInTheDocument();
    expect(screen.getByText("tope@afterhours.studio · All events")).toBeInTheDocument();
    expect(screen.getByText(/Ama Mensah/)).toBeInTheDocument();
    expect(screen.getByText(/Nia Otieno/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Resend" })).toBeInTheDocument();
  });

  test("shows role permissions panel", () => {
    render(<TeamRoles />);
    expect(
      screen.getByRole("heading", { name: "Role permissions" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Live operator")).toBeInTheDocument();
    expect(screen.getByText("Selected events only")).toBeInTheDocument();
    expect(screen.getByText("Run prompts & reminders")).toBeInTheDocument();
    expect(screen.getAllByText("Allowed").length).toBeGreaterThanOrEqual(3);
    expect(screen.getByText("Manage sales & payouts")).toBeInTheDocument();
    expect(screen.getAllByText("Not allowed").length).toBe(2);
    expect(screen.getByText(/Owner: full access/)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Save permissions" }),
    ).toBeInTheDocument();
  });
});
