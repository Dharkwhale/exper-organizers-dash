import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test } from "vitest";
import { Attendees } from "./Attendees";

describe("Attendees", () => {
  test("shows the check-in header, metrics and actions", () => {
    render(<Attendees />);
    expect(
      screen.getByRole("heading", { level: 1, name: "Attendees / Check-in" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Neon Solstice · Main entrance · Africa/Lagos · 25 Oct 2024"),
    ).toBeInTheDocument();
    expect(screen.getByText("1,240")).toBeInTheDocument();
    expect(screen.getByText("1,216")).toBeInTheDocument();
    expect(screen.getByText("24")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Scan QR ticket/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Manual lookup/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Export guest list/ })).toBeInTheDocument();
  });

  test("lists guests from the Figma mock with check-in states", () => {
    render(<Attendees />);
    expect(screen.getByRole("heading", { name: /Guest list/ })).toBeInTheDocument();
    expect(screen.getByText("/ Showing 6 of 1,240")).toBeInTheDocument();
    expect(screen.getByText("Ada Okafor")).toBeInTheDocument();
    expect(screen.getByText("General Access · NS-0428")).toBeInTheDocument();
    expect(screen.getAllByText("Checked in · 21:38").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByRole("button", { name: "Check in →" })).toHaveLength(2);
    expect(screen.getByText("VIP · Soundscape · NS-0529")).toBeInTheDocument();
    expect(screen.getByText("Page 1 of 207")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Next page/ })).toBeInTheDocument();
  });

  test("filters pending guests", async () => {
    const user = userEvent.setup();
    render(<Attendees />);
    await user.click(screen.getByRole("button", { name: "Pending 24" }));
    expect(screen.getByText("Dami Adebayo")).toBeInTheDocument();
    expect(screen.getByText("Bola Akande")).toBeInTheDocument();
    expect(screen.queryByText("Ada Okafor")).not.toBeInTheDocument();
    expect(screen.getByText("/ Showing 2 of 1,240")).toBeInTheDocument();
  });

  test("searches guests by name", async () => {
    const user = userEvent.setup();
    render(<Attendees />);
    await user.type(screen.getByLabelText("Search attendees"), "Kunle");
    expect(screen.getByText("Kunle Bello")).toBeInTheDocument();
    expect(screen.queryByText("Ada Okafor")).not.toBeInTheDocument();
  });
});
