import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Activity } from "react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { readEmail } from "@/lib/auth/email-state";
import { SignInForm } from "./SignInForm";

const push = vi.hoisted(() => vi.fn());
const signInMock = vi.hoisted(() => vi.fn());
const googleMock = vi.hoisted(() => vi.fn());
const search = vi.hoisted(() => ({ current: new URLSearchParams() }));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
  useSearchParams: () => search.current,
  usePathname: () => "/sign-in",
}));

vi.mock("@/lib/auth/api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/auth/api")>()),
  signIn: signInMock,
  signInWithGoogle: googleMock,
}));

// Google's real button is an iframe; the stub hands over a credential on click.
vi.mock("@/components/auth/GoogleButton", async () => {
  const React = await import("react");
  return {
    GoogleButton: (props: {
      verb: string;
      onCredential: (credential: { idToken: string; nonce: string }) => void;
    }) =>
      React.createElement(
        "button",
        {
          type: "button",
          onClick: () => props.onCredential({ idToken: "g-tok", nonce: "raw" }),
        },
        `${props.verb} with Google (test)`,
      ),
    GooglePlaceholder: () => null,
  };
});

const wrongPassword = {
  ok: false,
  code: "invalid_credentials",
  message: "Invalid email or password",
};

beforeEach(() => {
  push.mockClear();
  signInMock.mockReset();
  googleMock.mockReset();
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

  test("stays busy after a successful sign-in, until the page changes", async () => {
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
    const button = screen.getByRole("button", { name: "Sign in" });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");
  });

  test("comes back usable, with the password cleared, when its page is shown again", async () => {
    // Next keeps the page it navigated away from alive, hidden. After a
    // sign-out the sign-in page is shown again with its old state.
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
    const tree = (mode: "visible" | "hidden") => (
      <Activity mode={mode}>
        <SignInForm />
      </Activity>
    );
    const { rerender } = render(tree("visible"));
    await fillAndSubmit("tope@x.io", "good-pass-1!");
    await vi.waitFor(() => expect(push).toHaveBeenCalledWith("/overview"));

    rerender(tree("hidden"));
    rerender(tree("visible"));

    const button = screen.getByRole("button", { name: "Sign in" });
    expect(button).toBeEnabled();
    expect(button).not.toHaveAttribute("aria-busy");
    expect(screen.getByLabelText("Password")).toHaveValue("");
    expect(screen.getByLabelText("Email")).toHaveValue("tope@x.io");
  });

  test("an unverified account also stays busy on its way to verify", async () => {
    signInMock.mockResolvedValue({
      ok: false,
      code: "not_verified",
      message: "Email not verified",
    });
    render(<SignInForm />);
    await fillAndSubmit("tope@x.io", "good-pass-1!");
    await vi.waitFor(() => expect(push).toHaveBeenCalledWith("/verify"));
    expect(screen.getByRole("button", { name: "Sign in" })).toHaveAttribute(
      "aria-busy",
      "true",
    );
  });

  test("a failed sign-in frees the button again", async () => {
    render(<SignInForm />);
    await fillAndSubmit("tope@x.io", "bad");
    await screen.findByText(/Invalid email or password/);
    const button = screen.getByRole("button", { name: "Sign in" });
    expect(button).toBeEnabled();
    expect(button).not.toHaveAttribute("aria-busy");
  });

  describe("with Google", () => {
    const session = {
      user: { id: "u1", email: "tope@x.io" },
      roles: ["organizer"],
      isAdmin: false,
      workspace: { id: "w1", name: "Afterhours studio" },
      data: [],
    };
    const clickGoogle = async () => {
      const user = userEvent.setup();
      await user.click(screen.getByRole("button", { name: "Sign in with Google (test)" }));
    };

    test("signs in with the Google credential and goes to the overview, staying busy", async () => {
      googleMock.mockResolvedValue({ ok: true, data: session });
      render(<SignInForm />);
      await clickGoogle();
      await vi.waitFor(() => expect(push).toHaveBeenCalledWith("/overview"));
      expect(googleMock).toHaveBeenCalledWith({ idToken: "g-tok", nonce: "raw" });
      expect(screen.getByRole("button", { name: "Sign in" })).toHaveAttribute(
        "aria-busy",
        "true",
      );
    });

    test("a Google account that isn't an organiser is pointed to sign-up", async () => {
      googleMock.mockResolvedValue({
        ok: false,
        code: "not_organizer",
        message: "Not an organiser",
      });
      render(<SignInForm />);
      await clickGoogle();
      const alert = await screen.findByRole("alert");
      expect(alert).toHaveTextContent("This Google account isn't an organiser yet.");
      expect(screen.getByRole("link", { name: "Create an account" })).toHaveAttribute(
        "href",
        "/sign-up",
      );
      expect(push).not.toHaveBeenCalled();
      expect(screen.getByRole("button", { name: "Sign in" })).not.toHaveAttribute("aria-busy");
    });

    test("a rate limit says how long to wait", async () => {
      googleMock.mockResolvedValue({
        ok: false,
        code: "rate_limited",
        message: "Too many",
        retryAfterSeconds: 300,
      });
      render(<SignInForm />);
      await clickGoogle();
      expect(await screen.findByRole("alert")).toHaveTextContent(
        "Too many attempts. Try again in 5 minutes.",
      );
    });

    test("any other failure shows its message and frees the button", async () => {
      googleMock.mockResolvedValue({
        ok: false,
        code: "google_failed",
        message: "Google sign-in failed",
      });
      render(<SignInForm />);
      await clickGoogle();
      expect(await screen.findByRole("alert")).toHaveTextContent("Google sign-in failed");
      expect(screen.getByRole("button", { name: "Sign in" })).toBeEnabled();
    });

    test("two quick credentials sign in once", async () => {
      googleMock.mockReturnValue(new Promise(() => {}));
      render(<SignInForm />);
      const user = userEvent.setup();
      const button = screen.getByRole("button", { name: "Sign in with Google (test)" });
      await user.click(button);
      await user.click(button);
      expect(googleMock).toHaveBeenCalledTimes(1);
    });
  });

  test("shows the password-updated notice after a reset", () => {
    search.current = new URLSearchParams("reset=1");
    render(<SignInForm />);
    expect(
      screen.getByText("Password updated. Sign in with your new one."),
    ).toBeInTheDocument();
  });
});
