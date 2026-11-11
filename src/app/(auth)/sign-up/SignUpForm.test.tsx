import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Activity } from "react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { readEmail } from "@/lib/auth/email-state";
import { SignUpForm } from "./SignUpForm";

const push = vi.hoisted(() => vi.fn());
const signUpMock = vi.hoisted(() => vi.fn());
const googleMock = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
  usePathname: () => "/sign-up",
}));

vi.mock("@/lib/auth/api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/auth/api")>()),
  signUp: signUpMock,
  signUpWithGoogle: googleMock,
}));

// Google's real button is an iframe; the stub hands over a credential on click.
vi.mock("@/components/auth/GoogleButton", async () => {
  const React = await import("react");
  return {
    GoogleButton: (props: {
      verb: string;
      disabled?: boolean;
      onCredential: (credential: { idToken: string; nonce: string }) => void;
    }) =>
      React.createElement(
        "button",
        {
          type: "button",
          disabled: props.disabled,
          onClick: () => props.onCredential({ idToken: "g-tok", nonce: "raw" }),
        },
        `${props.verb} with Google (test)`,
      ),
    GooglePlaceholder: () => null,
  };
});

beforeEach(() => {
  push.mockClear();
  signUpMock.mockReset();
  googleMock.mockReset();
  signUpMock.mockResolvedValue({ ok: true, data: undefined });
  sessionStorage.clear();
});

async function fillValid(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText("Full name"), "Tope Adewale");
  await user.type(screen.getByLabelText("Work email"), " Tope@AfterHours.studio ");
  await user.type(screen.getByLabelText("Workspace name"), "Afterhours studio");
  await user.type(screen.getByLabelText("Password"), "abcdefghi1!");
  await user.click(screen.getByRole("checkbox", { name: /I agree to the Terms/ }));
}

const submit = (user: ReturnType<typeof userEvent.setup>) =>
  user.click(screen.getByRole("button", { name: "Create account" }));

describe("SignUpForm", () => {
  test("blocks submit and names each missing field", async () => {
    const user = userEvent.setup();
    render(<SignUpForm />);
    await submit(user);
    expect(await screen.findByText("Enter your full name.")).toBeInTheDocument();
    expect(screen.getByText("Enter a valid email address.")).toBeInTheDocument();
    expect(screen.getByText("Name your workspace.")).toBeInTheDocument();
    expect(screen.getByText("Agree to the Terms to continue.")).toBeInTheDocument();
    expect(signUpMock).not.toHaveBeenCalled();
    expect(push).not.toHaveBeenCalled();
  });

  test("rejects a password that misses the rule", async () => {
    const user = userEvent.setup();
    render(<SignUpForm />);
    await fillValid(user);
    await user.clear(screen.getByLabelText("Password"));
    await user.type(screen.getByLabelText("Password"), "short");
    await submit(user);
    expect(
      await screen.findByText("Use at least 10 characters, with a number and a symbol."),
    ).toBeInTheDocument();
    expect(signUpMock).not.toHaveBeenCalled();
  });

  test("shows the strength of the typed password", async () => {
    const user = userEvent.setup();
    render(<SignUpForm />);
    await user.type(screen.getByLabelText("Password"), "abcdefghijk1!");
    expect(screen.getByRole("status")).toHaveTextContent("Strong");
  });

  describe("with Google", () => {
    const googleButton = () =>
      screen.getByRole("button", { name: "Sign up with Google (test)" });
    const ready = async (user: ReturnType<typeof userEvent.setup>) => {
      await user.type(screen.getByLabelText("Workspace name"), " Afterhours studio ");
      await user.click(screen.getByRole("checkbox", { name: /I agree to the Terms/ }));
    };

    test("waits for a workspace name and the Terms before it can be used", async () => {
      const user = userEvent.setup();
      render(<SignUpForm />);
      expect(googleButton()).toBeDisabled();
      await user.type(screen.getByLabelText("Workspace name"), "Afterhours studio");
      expect(googleButton()).toBeDisabled();
      await user.click(screen.getByRole("checkbox", { name: /I agree to the Terms/ }));
      expect(googleButton()).toBeEnabled();
    });

    test("signs up with the workspace and the terms, then goes to the overview", async () => {
      googleMock.mockResolvedValue({
        ok: true,
        data: {
          user: { id: "u1", email: "tope@x.io" },
          roles: ["organizer"],
          isAdmin: false,
          workspace: { id: "w1", name: "Afterhours studio" },
          data: [],
        },
      });
      const user = userEvent.setup();
      render(<SignUpForm />);
      await ready(user);
      await user.click(googleButton());
      await vi.waitFor(() => expect(push).toHaveBeenCalledWith("/overview"));
      expect(googleMock).toHaveBeenCalledWith({
        idToken: "g-tok",
        nonce: "raw",
        workspaceName: "Afterhours studio",
        acceptedTerms: true,
      });
      expect(screen.getByRole("button", { name: "Create account" })).toHaveAttribute(
        "aria-busy",
        "true",
      );
    });

    test("shows a Google failure and frees the button", async () => {
      googleMock.mockResolvedValue({
        ok: false,
        code: "google_failed",
        message: "Google sign-up failed",
      });
      const user = userEvent.setup();
      render(<SignUpForm />);
      await ready(user);
      await user.click(googleButton());
      expect(await screen.findByText("Google sign-up failed")).toBeInTheDocument();
      expect(push).not.toHaveBeenCalled();
      expect(screen.getByRole("button", { name: "Create account" })).toBeEnabled();
    });
  });

  test("stays busy after a successful sign-up, until the page changes", async () => {
    const user = userEvent.setup();
    render(<SignUpForm />);
    await fillValid(user);
    await submit(user);
    await vi.waitFor(() => expect(push).toHaveBeenCalledWith("/verify"));
    const button = screen.getByRole("button", { name: "Create account" });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");
  });

  test("comes back usable, with the password cleared, when its page is shown again", async () => {
    const tree = (mode: "visible" | "hidden") => (
      <Activity mode={mode}>
        <SignUpForm />
      </Activity>
    );
    const user = userEvent.setup();
    const { rerender } = render(tree("visible"));
    await fillValid(user);
    await submit(user);
    await vi.waitFor(() => expect(push).toHaveBeenCalledWith("/verify"));

    rerender(tree("hidden"));
    rerender(tree("visible"));

    const button = screen.getByRole("button", { name: "Create account" });
    expect(button).toBeEnabled();
    expect(button).not.toHaveAttribute("aria-busy");
    expect(screen.getByLabelText("Password")).toHaveValue("");
  });

  test("a refused sign-up frees the button again", async () => {
    signUpMock.mockResolvedValue({
      ok: false,
      code: "email_taken",
      message: "That email is already registered",
    });
    const user = userEvent.setup();
    render(<SignUpForm />);
    await fillValid(user);
    await submit(user);
    await screen.findByText("That email is already registered");
    const button = screen.getByRole("button", { name: "Create account" });
    expect(button).toBeEnabled();
    expect(button).not.toHaveAttribute("aria-busy");
  });

  test("registers with the organizer fields and continues to verify", async () => {
    const user = userEvent.setup();
    render(<SignUpForm />);
    await fillValid(user);
    await submit(user);
    await vi.waitFor(() => expect(push).toHaveBeenCalledWith("/verify"));
    expect(signUpMock).toHaveBeenCalledWith({
      fullName: "Tope Adewale",
      email: "tope@afterhours.studio",
      workspaceName: "Afterhours studio",
      password: "abcdefghi1!",
      acceptedTerms: true,
    });
    expect(readEmail()).toBe("tope@afterhours.studio");
  });

  test("puts an existing-account error on the email field", async () => {
    signUpMock.mockResolvedValue({
      ok: false,
      code: "email_taken",
      message: "An account with this email already exists",
    });
    const user = userEvent.setup();
    render(<SignUpForm />);
    await fillValid(user);
    await submit(user);
    expect(
      await screen.findByText("An account with this email already exists"),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Work email")).toHaveAttribute("aria-invalid", "true");
    expect(push).not.toHaveBeenCalled();
  });

  test("shows a rate-limit wait and server validation messages", async () => {
    signUpMock.mockResolvedValueOnce({
      ok: false,
      code: "rate_limited",
      message: "Too many",
      retryAfterSeconds: 3600,
    });
    const user = userEvent.setup();
    render(<SignUpForm />);
    await fillValid(user);
    await submit(user);
    expect(
      await screen.findByText("Too many attempts. Try again in 60 minutes."),
    ).toBeInTheDocument();

    signUpMock.mockResolvedValueOnce({
      ok: false,
      code: "validation",
      message: "Password is too common",
    });
    await submit(user);
    expect(await screen.findByText("Password is too common")).toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();
  });
});
