import { render } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { PendingDot } from "./PendingDot";

const status = vi.hoisted(() => ({ pending: false }));
vi.mock("next/link", () => ({ useLinkStatus: () => status }));

beforeEach(() => {
  status.pending = false;
});

describe("PendingDot", () => {
  test("is always rendered, so showing it never shifts the layout, and is decorative", () => {
    const { container } = render(<PendingDot />);
    const dot = container.querySelector("[data-pending-dot]");
    expect(dot).not.toBeNull();
    expect(dot).toHaveAttribute("aria-hidden", "true");
  });

  test("is quiet while the link is idle", () => {
    const { container } = render(<PendingDot />);
    expect(container.querySelector("[data-pending-dot]")).not.toHaveAttribute(
      "data-pending",
    );
  });

  test("lights up while the link's page is loading", () => {
    status.pending = true;
    const { container } = render(<PendingDot />);
    expect(container.querySelector("[data-pending-dot]")).toHaveAttribute(
      "data-pending",
      "true",
    );
  });
});
