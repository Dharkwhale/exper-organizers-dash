import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { AppShell } from "./AppShell";

const nav = vi.hoisted(() => ({ pathname: "/overview" }));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn() }),
  usePathname: () => nav.pathname,
}));

beforeEach(() => {
  nav.pathname = "/overview";
});

function renderShell(props: Partial<React.ComponentProps<typeof AppShell>> = {}) {
  return render(
    <AppShell
      workspaceName="Afterhours studio"
      userName="Tope Adewale"
      roleLine="Owner · All events"
      {...props}
    >
      <p>page body</p>
    </AppShell>,
  );
}

const SOON = [
  "Attendees",
  "Sales",
  "Moments",
  "Reports",
  "Payouts",
  "Team / Roles",
  "Settings",
];

describe("AppShell", () => {
  test("renders the page it wraps", () => {
    renderShell();
    expect(screen.getByText("page body")).toBeInTheDocument();
  });

  test("names the workspace in the sidebar", () => {
    renderShell();
    expect(screen.getByText("Afterhours studio")).toBeInTheDocument();
    expect(screen.getByText("Organiser workspace")).toBeInTheDocument();
  });

  test("shows the breadcrumb with workspace, page and person", () => {
    renderShell();
    expect(
      screen.getByText("Afterhours studio / Overview / Tope Adewale"),
    ).toBeInTheDocument();
  });

  test("marks Overview as the current page", () => {
    renderShell();
    expect(screen.getByRole("link", { name: "Overview" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  test("Events is a real link, and not current while on Overview", () => {
    renderShell();
    const events = screen.getByRole("link", { name: "Events" });
    expect(events).toHaveAttribute("href", "/events");
    expect(events).not.toHaveAttribute("aria-current");
  });

  test("on the Events page, Events is current, Overview is not, and the breadcrumb follows", () => {
    nav.pathname = "/events";
    renderShell();
    expect(screen.getByRole("link", { name: "Events" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: "Overview" })).not.toHaveAttribute(
      "aria-current",
    );
    expect(
      screen.getByText("Afterhours studio / Events / Tope Adewale"),
    ).toBeInTheDocument();
  });

  test("a page under /events still counts as Events", () => {
    nav.pathname = "/events/abc";
    renderShell();
    expect(screen.getByRole("link", { name: "Events" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  test("Experience Builder is a real link and becomes current on its page", () => {
    const first = renderShell();
    expect(screen.getByRole("link", { name: "Experience Builder" })).toHaveAttribute(
      "href",
      "/experience-builder",
    );
    first.unmount();
    nav.pathname = "/experience-builder";
    renderShell();
    expect(
      screen.getByRole("link", { name: "Experience Builder" }),
    ).toHaveAttribute("aria-current", "page");
    expect(
      screen.getByText("Afterhours studio / Experience Builder / Tope Adewale"),
    ).toBeInTheDocument();
  });

  test("Live Control is a real link and becomes current on its page", () => {
    const first = renderShell();
    expect(screen.getByRole("link", { name: "Live Control" })).toHaveAttribute(
      "href",
      "/live-control",
    );
    first.unmount();
    nav.pathname = "/live-control";
    renderShell();
    expect(screen.getByRole("link", { name: "Live Control" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(
      screen.getByText("Afterhours studio / Live Control / Tope Adewale"),
    ).toBeInTheDocument();
  });

  test.each(SOON)("%s is shown but disabled until its page exists", (label) => {
    renderShell();
    expect(screen.getByText(label).closest("[aria-disabled]")).toHaveAttribute(
      "aria-disabled",
      "true",
    );
    expect(screen.queryByRole("link", { name: label })).not.toBeInTheDocument();
  });

  test("shows the person and their role", () => {
    renderShell();
    expect(screen.getByText("Tope Adewale")).toBeInTheDocument();
    expect(screen.getByText("Owner · All events")).toBeInTheDocument();
    expect(screen.getByText("Help & support")).toBeInTheDocument();
  });

  test("offers a Sign out button in the sidebar", () => {
    renderShell();
    expect(screen.getByRole("button", { name: "Sign out" })).toBeInTheDocument();
  });

  test("falls back to plain words when the names are missing", () => {
    renderShell({ workspaceName: null, userName: null });
    expect(screen.getByText("Your workspace")).toBeInTheDocument();
    expect(screen.getByText("Your account")).toBeInTheDocument();
    expect(document.body).not.toHaveTextContent("null");
  });

  test("the menu button opens and closes the sidebar on small screens", async () => {
    const user = userEvent.setup();
    renderShell();
    const menu = screen.getByRole("button", { name: "Open menu" });
    expect(menu).toHaveAttribute("aria-expanded", "false");
    await user.click(menu);
    expect(screen.getByRole("button", { name: "Close menu" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
  });
});
