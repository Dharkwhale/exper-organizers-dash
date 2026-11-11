import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { Button } from "./Button";

describe("Button", () => {
  test("when busy it shows a decorative spinner, keeps its label, and is disabled", () => {
    const { container } = render(<Button busy>Sign in</Button>);
    const button = screen.getByRole("button", { name: "Sign in" });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");
    const spinner = container.querySelector("[data-spinner]");
    expect(spinner).not.toBeNull();
    expect(spinner).toHaveAttribute("aria-hidden", "true");
  });

  test("when idle it has no spinner and is enabled", () => {
    const { container } = render(<Button>Sign in</Button>);
    const button = screen.getByRole("button", { name: "Sign in" });
    expect(button).toBeEnabled();
    expect(button).not.toHaveAttribute("aria-busy");
    expect(container.querySelector("[data-spinner]")).toBeNull();
  });

  test("the spinner slows to a pulse for people who prefer reduced motion", () => {
    const { container } = render(<Button busy>Sign in</Button>);
    const classes = container.querySelector("[data-spinner]")!.className;
    expect(classes).toContain("animate-spin");
    expect(classes).toContain("motion-reduce:animate-pulse");
  });
});
