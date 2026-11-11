import { render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { AuthShell } from "./AuthShell";

const nav = vi.hoisted(() => ({ pathname: "/sign-in" }));
vi.mock("next/navigation", () => ({ usePathname: () => nav.pathname }));

beforeEach(() => {
  nav.pathname = "/sign-in";
});

function renderShell() {
  return render(
    <AuthShell headline={<>Doors open</>} subtext="Sign in to run your events.">
      <p>the form</p>
    </AuthShell>,
  );
}

describe("AuthShell", () => {
  test("shows the headline, the subtext and the page it wraps", () => {
    renderShell();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Doors open");
    expect(screen.getByText("Sign in to run your events.")).toBeInTheDocument();
    expect(screen.getByText("the form")).toBeInTheDocument();
  });

  test("the logo links home to sign in", () => {
    renderShell();
    expect(screen.getByRole("link", { name: "EXPER" })).toHaveAttribute("href", "/sign-in");
  });

  test("on the sign-in side it offers Create account", () => {
    renderShell();
    expect(screen.getByText("New to EXPER?")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Create account" })).toHaveAttribute(
      "href",
      "/sign-up",
    );
  });

  test.each(["/sign-up", "/verify"])("on %s it offers Sign in", (pathname) => {
    nav.pathname = pathname;
    renderShell();
    expect(screen.getByText("Have an account?")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Sign in" })).toHaveAttribute("href", "/sign-in");
  });

  test("the product preview is decorative and hidden from assistive tech", () => {
    const { container } = renderShell();
    const preview = container.querySelector("[data-auth-preview]");
    expect(preview).not.toBeNull();
    expect(preview).toHaveAttribute("aria-hidden", "true");
  });

  test("the footer has the tagline and the Help, Privacy and Terms links", () => {
    renderShell();
    expect(screen.getByText("People first. Aggregate by design.")).toBeInTheDocument();
    const footer = within(screen.getByRole("navigation", { name: "Footer" }));
    for (const name of ["Help", "Privacy", "Terms"]) {
      expect(footer.getByRole("link", { name })).toBeInTheDocument();
    }
  });
});
