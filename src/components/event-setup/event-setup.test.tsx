import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test } from "vitest";
import { EventSetupProvider } from "./EventSetupProvider";
import { AccessStep } from "./steps/AccessStep";
import { BasicsStep } from "./steps/BasicsStep";
import { DateVenueStep } from "./steps/DateVenueStep";
import { ExperienceStep } from "./steps/ExperienceStep";
import { ReviewStep } from "./steps/ReviewStep";

function renderStep(node: React.ReactNode) {
  return render(<EventSetupProvider>{node}</EventSetupProvider>);
}

describe("Event setup flow", () => {
  test("Basics shows the draft title, cover controls and next step", () => {
    renderStep(<BasicsStep />);
    expect(
      screen.getByRole("heading", { level: 1, name: "Event setup / Basics" }),
    ).toBeInTheDocument();
    expect(screen.getByDisplayValue("Neon Solstice")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Change cover/ })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Next: Date \/ Venue/ })).toHaveAttribute(
      "href",
      "/events/setup/date-venue",
    );
    expect(screen.getByText("ATTENDEE APP PREVIEW")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Get access" })).toBeInTheDocument();
  });

  test("editing the title updates the attendee preview", async () => {
    const user = userEvent.setup();
    renderStep(<BasicsStep />);
    const title = screen.getByDisplayValue("Neon Solstice");
    await user.clear(title);
    await user.type(title, "Midnight Parade");
    expect(screen.getAllByText("Midnight Parade").length).toBeGreaterThan(0);
  });

  test("Date / Venue shows venue fields and the venue toggle", () => {
    renderStep(<DateVenueStep />);
    expect(
      screen.getByRole("heading", { level: 1, name: "Event setup / Date / Venue" }),
    ).toBeInTheDocument();
    expect(screen.getByDisplayValue("Landmark Beach")).toBeInTheDocument();
    expect(screen.getByRole("switch")).toHaveAttribute("aria-checked", "true");
    expect(screen.getByRole("link", { name: /Next: Access/ })).toHaveAttribute(
      "href",
      "/events/setup/access",
    );
  });

  test("Access shows ticket types and capacity", () => {
    renderStep(<AccessStep />);
    expect(screen.getByText(/General Access — ₦25,000/)).toBeInTheDocument();
    expect(screen.getByText(/VIP · Soundscape — ₦65,000/)).toBeInTheDocument();
    expect(screen.getByText(/Squad Bundle \(4×\) — ₦85,000/)).toBeInTheDocument();
    expect(screen.getByText(/1,600 places/)).toBeInTheDocument();
  });

  test("Experience lists run of show and builder entry", () => {
    renderStep(<ExperienceStep />);
    expect(screen.getByText("One has to go")).toBeInTheDocument();
    expect(screen.getByText("Find Something Blue")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Open Experience Builder/ }),
    ).toHaveAttribute("href", "/experience-builder");
  });

  test("Review summarises every section with edit links", () => {
    renderStep(<ReviewStep />);
    expect(screen.getByText("Ready for the room?")).toBeInTheDocument();
    expect(screen.getByText("5 / 5 checked")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Publish event" })).toHaveAttribute(
      "href",
      "/events",
    );
    const editLinks = screen.getAllByRole("link", { name: "Edit" });
    expect(editLinks).toHaveLength(4);
  });
});
