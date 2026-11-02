import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { writeEmail } from "@/lib/auth/email-state";
import { CheckInbox, InboxMessage } from "./CheckInbox";

const requestResetMock = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => "/check-inbox",
}));

vi.mock("@/lib/auth/api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/auth/api")>()),
  requestReset: requestResetMock,
}));

beforeEach(() => {
  requestResetMock.mockReset();
  requestResetMock.mockResolvedValue({ ok: true, data: undefined });
  sessionStorage.clear();
});

describe("InboxMessage", () => {
  test("names the address the link was sent to", () => {
    writeEmail("tope@afterhours.studio");
    render(<InboxMessage />);
    expect(
      screen.getByText(
        "We sent a reset link to tope@afterhours.studio. It works once and expires in 30 minutes.",
      ),
    ).toBeInTheDocument();
  });

  test("falls back to generic copy with no stored email", () => {
    render(<InboxMessage />);
    expect(
      screen.getByText(
        "We sent a reset link to your email. It works once and expires in 30 minutes.",
      ),
    ).toBeInTheDocument();
    expect(document.body).not.toHaveTextContent("undefined");
  });
});

describe("CheckInbox", () => {
  test("lists the three troubleshooting tips", () => {
    render(<CheckInbox />);
    expect(screen.getByText("Check spam or promotions")).toBeInTheDocument();
    expect(screen.getByText("Check the address")).toBeInTheDocument();
    expect(screen.getByText("Wait a minute")).toBeInTheDocument();
  });

  test("resends once and confirms", async () => {
    writeEmail("tope@afterhours.studio");
    const user = userEvent.setup();
    render(<CheckInbox />);
    await user.click(screen.getByRole("button", { name: "Resend link" }));
    expect(await screen.findByText("Link sent again.")).toBeInTheDocument();
    expect(requestResetMock).toHaveBeenCalledTimes(1);
    expect(requestResetMock).toHaveBeenCalledWith("tope@afterhours.studio");
  });

  test("explains a failed resend without claiming it was sent", async () => {
    writeEmail("tope@afterhours.studio");
    requestResetMock.mockResolvedValue({
      ok: false,
      code: "rate_limited",
      message: "Too many",
      retryAfterSeconds: 900,
    });
    const user = userEvent.setup();
    render(<CheckInbox />);
    await user.click(screen.getByRole("button", { name: "Resend link" }));
    expect(
      await screen.findByText("Too many attempts. Try again in 15 minutes."),
    ).toBeInTheDocument();
    expect(screen.queryByText("Link sent again.")).not.toBeInTheDocument();
  });

  test("asks to start over when the email is missing", async () => {
    const user = userEvent.setup();
    render(<CheckInbox />);
    await user.click(screen.getByRole("button", { name: "Resend link" }));
    expect(
      await screen.findByText("We don't have your email. Go back and enter it again."),
    ).toBeInTheDocument();
    expect(requestResetMock).not.toHaveBeenCalled();
  });

  test("links back to sign-in", () => {
    render(<CheckInbox />);
    expect(screen.getByRole("link", { name: "Back to sign in" })).toHaveAttribute(
      "href",
      "/sign-in",
    );
  });
});
