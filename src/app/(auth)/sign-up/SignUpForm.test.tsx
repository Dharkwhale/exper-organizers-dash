import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { readEmail } from "@/lib/auth/email-state";
import { SignUpForm } from "./SignUpForm";

const push = vi.hoisted(() => vi.fn());
const signUpMock = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
  usePathname: () => "/sign-up",
}));

vi.mock("@/lib/auth/api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/auth/api")>()),
  signUp: signUpMock,
}));

beforeEach(() => {
  push.mockClear();
  signUpMock.mockReset();
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
