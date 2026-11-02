import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { readEmail } from "@/lib/auth/email-state";
import { ForgotForm } from "./ForgotForm";

const push = vi.hoisted(() => vi.fn());
const requestResetMock = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
  usePathname: () => "/forgot-password",
}));

vi.mock("@/lib/auth/api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/auth/api")>()),
  requestReset: requestResetMock,
}));

beforeEach(() => {
  push.mockClear();
  requestResetMock.mockReset();
  requestResetMock.mockResolvedValue({ ok: true, data: undefined });
  sessionStorage.clear();
});

const send = (user: ReturnType<typeof userEvent.setup>) =>
  user.click(screen.getByRole("button", { name: "Send reset link" }));

describe("ForgotForm", () => {
  test("blocks an invalid email without sending", async () => {
    const user = userEvent.setup();
    render(<ForgotForm />);
    await user.type(screen.getByLabelText("Email"), "nope");
    await send(user);
    expect(
      await screen.findByText("Enter a valid email address."),
    ).toBeInTheDocument();
    expect(requestResetMock).not.toHaveBeenCalled();
    expect(push).not.toHaveBeenCalled();
  });

  test("stores the normalized email and moves to check-inbox", async () => {
    const user = userEvent.setup();
    render(<ForgotForm />);
    await user.type(screen.getByLabelText("Email"), " Tope@AfterHours.studio ");
    await send(user);
    await vi.waitFor(() => expect(push).toHaveBeenCalledWith("/check-inbox"));
    expect(requestResetMock).toHaveBeenCalledWith("tope@afterhours.studio");
    expect(readEmail()).toBe("tope@afterhours.studio");
  });

  test("explains a rate limit and stays on the page", async () => {
    requestResetMock.mockResolvedValue({
      ok: false,
      code: "rate_limited",
      message: "Too many",
      retryAfterSeconds: 3600,
    });
    const user = userEvent.setup();
    render(<ForgotForm />);
    await user.type(screen.getByLabelText("Email"), "tope@x.io");
    await send(user);
    expect(
      await screen.findByText("Too many attempts. Try again in 60 minutes."),
    ).toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();
  });

  test("shows a network failure", async () => {
    requestResetMock.mockResolvedValue({
      ok: false,
      code: "network",
      message: "Couldn't reach the server. Try again.",
    });
    const user = userEvent.setup();
    render(<ForgotForm />);
    await user.type(screen.getByLabelText("Email"), "tope@x.io");
    await send(user);
    expect(
      await screen.findByText("Couldn't reach the server. Try again."),
    ).toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();
  });

  test("links back to sign-in", () => {
    render(<ForgotForm />);
    expect(screen.getByRole("link", { name: "Back to sign in" })).toHaveAttribute(
      "href",
      "/sign-in",
    );
  });
});
