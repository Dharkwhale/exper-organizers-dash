import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Activity } from "react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { writeEmail } from "@/lib/auth/email-state";
import { VerifyForm } from "./VerifyForm";

const verifyMock = vi.hoisted(() => vi.fn());
const resendMock = vi.hoisted(() => vi.fn());
const push = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
  usePathname: () => "/verify",
}));

vi.mock("@/lib/auth/api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/auth/api")>()),
  verifyCode: verifyMock,
  resendCode: resendMock,
}));

const signedIn = {
  ok: true,
  data: {
    user: { id: "u1", email: "tope@afterhours.studio" },
    roles: ["organizer"],
    isAdmin: false,
    workspace: { id: "w1", name: "Afterhours studio" },
    data: [],
  },
};

beforeEach(() => {
  sessionStorage.clear();
  push.mockClear();
  verifyMock.mockReset();
  resendMock.mockReset();
  verifyMock.mockResolvedValue(signedIn);
  resendMock.mockResolvedValue({ ok: true, data: undefined });
});
afterEach(() => vi.useRealTimers());

const box = (n: number) => screen.getByLabelText(`Digit ${n} of 6`);

describe("VerifyForm", () => {
  test("shows the address the code was sent to", async () => {
    writeEmail("tope@afterhours.studio");
    render(<VerifyForm />);
    expect(
      await screen.findByText("Sent to tope@afterhours.studio"),
    ).toBeInTheDocument();
  });

  test("falls back to generic copy when no email is stored", () => {
    render(<VerifyForm />);
    expect(screen.getByText("Sent to your email")).toBeInTheDocument();
    expect(document.body).not.toHaveTextContent("undefined");
  });

  test("verifies the typed code for the stored email and goes to the overview", async () => {
    writeEmail("tope@afterhours.studio");
    const user = userEvent.setup();
    render(<VerifyForm />);
    await user.click(box(1));
    await user.keyboard("482913");
    await vi.waitFor(() => expect(push).toHaveBeenCalledWith("/overview"));
    expect(verifyMock).toHaveBeenCalledWith("tope@afterhours.studio", "482913");
  });

  test("stays busy after a good code, until the page changes", async () => {
    writeEmail("tope@afterhours.studio");
    const user = userEvent.setup();
    render(<VerifyForm />);
    await user.click(box(1));
    await user.keyboard("482913");
    await vi.waitFor(() => expect(push).toHaveBeenCalledWith("/overview"));
    const button = screen.getByRole("button", { name: "Verify email" });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");
  });

  test("comes back usable, with the code cleared, when its page is shown again", async () => {
    writeEmail("tope@afterhours.studio");
    const tree = (mode: "visible" | "hidden") => (
      <Activity mode={mode}>
        <VerifyForm />
      </Activity>
    );
    const user = userEvent.setup();
    const { rerender } = render(tree("visible"));
    await user.click(box(1));
    await user.keyboard("482913");
    await vi.waitFor(() => expect(push).toHaveBeenCalledWith("/overview"));

    rerender(tree("hidden"));
    rerender(tree("visible"));

    const button = screen.getByRole("button", { name: "Verify email" });
    expect(button).toBeEnabled();
    expect(button).not.toHaveAttribute("aria-busy");
    expect(box(1)).toHaveValue("");
  });

  test("a wrong code frees the button again", async () => {
    verifyMock.mockResolvedValue({
      ok: false,
      code: "bad_code",
      message: "Invalid token",
    });
    writeEmail("tope@afterhours.studio");
    const user = userEvent.setup();
    render(<VerifyForm />);
    await user.click(box(1));
    await user.keyboard("000000");
    await screen.findByText("That code isn't right. Try again.");
    const button = screen.getByRole("button", { name: "Verify email" });
    expect(button).toBeEnabled();
    expect(button).not.toHaveAttribute("aria-busy");
  });

  test("flags a wrong code on every box", async () => {
    writeEmail("tope@afterhours.studio");
    verifyMock.mockResolvedValue({
      ok: false,
      code: "bad_code",
      message: "Invalid or expired code",
    });
    const user = userEvent.setup();
    render(<VerifyForm />);
    await user.click(box(1));
    await user.keyboard("000000");
    expect(
      await screen.findByText("That code isn't right. Try again."),
    ).toBeInTheDocument();
    expect(box(3)).toHaveAttribute("aria-invalid", "true");
  });

  test("shows a wait time when verification is rate limited", async () => {
    writeEmail("tope@afterhours.studio");
    verifyMock.mockResolvedValue({
      ok: false,
      code: "rate_limited",
      message: "Too many",
      retryAfterSeconds: 600,
    });
    const user = userEvent.setup();
    render(<VerifyForm />);
    await user.click(box(1));
    await user.keyboard("123456");
    expect(
      await screen.findByText("Too many attempts. Try again in 10 minutes."),
    ).toBeInTheDocument();
  });

  test("asks to start over when the email was lost", async () => {
    const user = userEvent.setup();
    render(<VerifyForm />);
    await user.click(box(1));
    await user.keyboard("482913");
    expect(
      await screen.findByText("We lost track of your email. Start again from sign up."),
    ).toBeInTheDocument();
    expect(verifyMock).not.toHaveBeenCalled();
  });

  test("links back to sign-up to use a different email", () => {
    render(<VerifyForm />);
    expect(
      screen.getByRole("link", { name: "Use a different email" }),
    ).toHaveAttribute("href", "/sign-up");
  });

  test("counts down, then resends a real code and restarts the countdown", async () => {
    writeEmail("tope@afterhours.studio");
    vi.useFakeTimers();
    render(<VerifyForm />);
    expect(screen.getByText("Resend code in 1:00")).toBeInTheDocument();

    act(() => vi.advanceTimersByTime(8000));
    expect(screen.getByText("Resend code in 0:52")).toBeInTheDocument();

    act(() => vi.advanceTimersByTime(52000));
    const resend = screen.getByRole("button", { name: "Resend code" });
    expect(resend).toBeEnabled();

    await act(async () => {
      resend.click();
    });
    expect(resendMock).toHaveBeenCalledWith("tope@afterhours.studio");
    expect(screen.getByText("Resend code in 1:00")).toBeInTheDocument();
    expect(screen.getByText("Code sent again.")).toBeInTheDocument();
  });

  test("keeps the resend button and explains when resending is limited", async () => {
    writeEmail("tope@afterhours.studio");
    resendMock.mockResolvedValue({
      ok: false,
      code: "rate_limited",
      message: "Too many",
      retryAfterSeconds: 1800,
    });
    vi.useFakeTimers();
    render(<VerifyForm />);
    act(() => vi.advanceTimersByTime(60000));

    await act(async () => {
      screen.getByRole("button", { name: "Resend code" }).click();
    });
    expect(
      screen.getByText("Too many attempts. Try again in 30 minutes."),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Resend code" })).toBeEnabled();
  });
});
