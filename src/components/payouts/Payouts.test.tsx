import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { Payouts } from "./Payouts";

describe("Payouts", () => {
  test("shows the payouts header, currencies and metrics", () => {
    render(<Payouts />);
    expect(screen.getByRole("heading", { level: 1, name: "Payouts" })).toBeInTheDocument();
    expect(
      screen.getByText(
        "Balances are separated by currency. No conversion or mixed-currency totals.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "NGN" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByText("Available NGN")).toBeInTheDocument();
    expect(screen.getAllByText("₦8,275,000").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("₦25,553,750")).toBeInTheDocument();
    expect(screen.getByText("₦12,640,000")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Export statement/ })).toBeInTheDocument();
  });

  test("shows transfer funds, history and balances", () => {
    render(<Payouts />);
    expect(screen.getByRole("heading", { name: "Transfer funds" })).toBeInTheDocument();
    expect(screen.getByText("From currency balance")).toBeInTheDocument();
    expect(screen.getByText("NGN — Available ₦8,275,000")).toBeInTheDocument();
    expect(
      screen.getByText("Afterhours Studio Ltd · GTBank · •••• 4829"),
    ).toBeInTheDocument();
    expect(screen.getByText("Amount in NGN")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Review transfer" })).toBeInTheDocument();

    expect(screen.getByRole("heading", { name: "Transfer history" })).toBeInTheDocument();
    expect(screen.getByText("NGN-0823 · Completed")).toBeInTheDocument();
    expect(screen.getByText("₦5,815,000")).toBeInTheDocument();
    expect(screen.getByText("21 Oct 2026 · GTBank •••• 4829")).toBeInTheDocument();

    expect(
      screen.getByRole("heading", { name: "Balances by currency" }),
    ).toBeInTheDocument();
    expect(screen.getByText("NGN · Nigeria")).toBeInTheDocument();
    expect(screen.getByText("Bank verification needed")).toBeInTheDocument();
    expect(screen.getByText("EUR · Germany")).toBeInTheDocument();
    expect(screen.getByText("No settled sales yet")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Manage bank accounts" }),
    ).toBeInTheDocument();
  });
});
