import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test } from "vitest";
import { Sales } from "./Sales";

describe("Sales", () => {
  test("shows the sales header, currencies and metrics", () => {
    render(<Sales />);
    expect(screen.getByRole("heading", { level: 1, name: "Sales" })).toBeInTheDocument();
    expect(
      screen.getByText(
        "Neon Solstice · NGN ledger · Orders and guest places are counted separately.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "NGN" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: "GBP" })).toBeInTheDocument();
    expect(screen.getByText("₦35,300,000")).toBeInTheDocument();
    expect(screen.getByText("₦425,000")).toBeInTheDocument();
    expect(screen.getByText("₦33,828,750")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Export statement/ })).toBeInTheDocument();
  });

  test("shows access sold, capacity, recent orders and ledgers", () => {
    render(<Sales />);
    expect(screen.getByRole("heading", { name: /Access sold/ })).toBeInTheDocument();
    expect(screen.getByText("/ 1,240 guest places")).toBeInTheDocument();
    expect(screen.getByText("General Access")).toBeInTheDocument();
    expect(screen.getByText("₦18,900,000")).toBeInTheDocument();
    expect(screen.getByText("VIP - Soundscape")).toBeInTheDocument();
    expect(screen.getByText("Complimentary access")).toBeInTheDocument();
    expect(
      screen.getByText(/Guest places: 756 \+ 180 \+ 304 - 17 \+ 17 = 1,240/),
    ).toBeInTheDocument();

    expect(screen.getByRole("heading", { name: "Guest capacity" })).toBeInTheDocument();
    expect(screen.getByText("1,240 / 1,600")).toBeInTheDocument();
    expect(
      screen.getByText(
        "360 places available. Registration is not the same as check-in.",
      ),
    ).toBeInTheDocument();

    expect(screen.getByRole("heading", { name: /Recent orders/ })).toBeInTheDocument();
    expect(screen.getByText("NS-1048 · Tolu James · ₦25,000 · Paid")).toBeInTheDocument();
    expect(screen.getByText("25 Oct · 21:34 WAT · 1 x General Access")).toBeInTheDocument();

    expect(
      screen.getByRole("heading", { name: "Other event ledgers" }),
    ).toBeInTheDocument();
    expect(screen.getByText("London · GBP · £6,545")).toBeInTheDocument();
    expect(screen.getByText("Berlin · EUR · €0")).toBeInTheDocument();
    expect(screen.getByText("Art X · Draft")).toBeInTheDocument();
  });

  test("currency pills can switch active state", async () => {
    const user = userEvent.setup();
    render(<Sales />);
    await user.click(screen.getByRole("button", { name: "USD" }));
    expect(screen.getByRole("button", { name: "USD" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: "NGN" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });
});
