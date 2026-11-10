import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { readEmail } from "@/lib/auth/email-state";
import { SignInForm } from "./SignInForm";

const push = vi.hoisted(() => vi.fn());
const signInMock = vi.hoisted(() => vi.fn());
const search = vi.hoisted(() => ({ current: new URLSearchParams() }));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
  useSearchParams: () => search.current,
  usePathname: () => "/sign-in",
}));

vi.mock("@/lib/auth/api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/auth/api")>()),
  signIn: signInMock,
}));

const wrongPassword = {
  ok: false,
  code: "invalid_credentials",
  message: "Invalid email or password",
};

beforeEach(() => {
  push.mockClear();
  signInMock.mockReset();
  signInMock.mockResolvedValue(wrongPassword);
  search.current = new URLSearchParams();
  sessionStorage.clear();
});

async function fillAndSubmit(email: string, password: string) {
  const user = userEvent.setup();
  await user.clear(screen.getByLabelText("Email"));
  await user.type(screen.getByLabelText("Email"), email);
  await user.clear(screen.getByLabelText("Password"));
  await user.type(screen.getByLabelText("Password"), password);
  await user.click(screen.getByRole("button", { name: "Sign in" }));
  return user;
}

describe("SignInForm", () => {
  test("blocks submit and explains when the email is invalid", async () => {
    render(<SignInForm />);
    await fillAndSubmit("nope", "whatever");
    expect(
      await screen.findByText("Enter a valid email address."),
    ).toBeInTheDocument();
    expect(signInMock).not.toHaveBeenCalled();
  });

  test("shows the server's invalid-credentials message on the password field", async () => {
    render(<SignInForm />);
    await fillAndSubmit("tope@x.io", "bad");
    expect(
      await screen.findByText("Invalid email or password. Try again or reset it."),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
  });

  test("tells the person how long to wait when rate limited", async () => {
    signInMock.mockResolvedValue({
      ok: false,
      code: "rate_limited",
      message: "Too many requests",
      retryAfterSeconds: 300,
    });
    render(<SignInForm />);
    await fillAndSubmit("tope@x.io", "bad");
    expect(
      await screen.findByText("Too many attempts. Try again in 5 minutes."),
    ).toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();
  });

  test("sends an unverified account to the code screen", async () => {
    signInMock.mockResolvedValue({
      ok: false,
      code: "not_verified",
      message: "Email not verified. Request a new code via /auth/resend-otp",
    });
    render(<SignInForm />);
    await fillAndSubmit("tope@x.io", "pw");
    await vi.waitFor(() => expect(push).toHaveBeenCalledWith("/verify"));
    expect(readEmail()).toBe("tope@x.io");
  });

  test("shows the not-an-organizer message", async () => {
    signInMock.mockResolvedValue({
      ok: false,
      code: "not_organizer",
      message: "This account is not an organizer",
    });
    render(<SignInForm />);
    await fillAndSubmit("tope@x.io", "pw");
    expect(
      await screen.findByText("This account is not an organizer"),
    ).toBeInTheDocument();
  });

  test("shows a network failure instead of hanging", async () => {
    signInMock.mockResolvedValue({
      ok: false,
      code: "network",
      message: "Couldn't reach the server. Try again.",
    });
    render(<SignInForm />);
    await fillAndSubmit("tope@x.io", "pw");
    expect(
      await screen.findByText("Couldn't reach the server. Try again."),
    ).toBeInTheDocument();
  });

  test("submits once when the button is double-clicked while pending", async () => {
    let release!: () => void;
    signInMock.mockReturnValue(
      new Promise((resolve) => {
        release = () => resolve(wrongPassword);
      }),
    );
    const user = userEvent.setup();
    render(<SignInForm />);
    await user.type(screen.getByLabelText("Email"), "tope@x.io");
    await user.type(screen.getByLabelText("Password"), "bad");
    await user.dblClick(screen.getByRole("button", { name: "Sign in" }));
    expect(signInMock).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("button", { name: "Sign in" })).toBeDisabled();
    release();
    await screen.findByText(/Invalid email or password/);
    expect(signInMock).toHaveBeenCalledTimes(1);
  });

  test("trims and lowercases the email before signing in", async () => {
    render(<SignInForm />);
    await fillAndSubmit(" Tope@X.io ", "bad");
    await screen.findByText(/Invalid email or password/);
    expect(signInMock).toHaveBeenCalledWith("tope@x.io", "bad");
  });

  test("goes to the overview after a successful sign-in", async () => {
    signInMock.mockResolvedValue({
      ok: true,
      data: {
        user: { id: "u1", email: "tope@x.io" },
        roles: ["organizer"],
        isAdmin: false,
        workspace: { id: "w1", name: "Afterhours studio" },
        data: [],
      },
    });
    render(<SignInForm />);
    await fillAndSubmit("tope@x.io", "good-pass-1!");
    await vi.waitFor(() => expect(push).toHaveBeenCalledWith("/overview"));
  });

  test("shows the password-updated notice after a reset", () => {
    search.current = new URLSearchParams("reset=1");
    render(<SignInForm />);
    expect(
      screen.getByText("Password updated. Sign in with your new one."),
    ).toBeInTheDocument();
  });
});
