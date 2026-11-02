import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { ResetForm } from "./ResetForm";

const push = vi.hoisted(() => vi.fn());
const search = vi.hoisted(() => ({ current: new URLSearchParams() }));
const checkMock = vi.hoisted(() => vi.fn());
const setPasswordMock = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
  useSearchParams: () => search.current,
  usePathname: () => "/reset-password",
}));

vi.mock("@/lib/auth/api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/auth/api")>()),
  checkResetLink: checkMock,
  setPassword: setPasswordMock,
}));

beforeEach(() => {
  push.mockClear();
  search.current = new URLSearchParams("token_hash=abc");
  checkMock.mockReset();
  checkMock.mockResolvedValue({ ok: true, data: { email: "tope@afterhours.studio" } });
  setPasswordMock.mockReset();
  setPasswordMock.mockResolvedValue({ ok: true, data: undefined });
});

const row = (label: string) => screen.getByText(label).closest("li");

async function renderReady() {
  const user = userEvent.setup();
  render(<ResetForm />);
  await screen.findByLabelText("New password");
  return user;
}

async function submit(
  user: ReturnType<typeof userEvent.setup>,
  password: string,
  confirm: string,
) {
  await user.clear(screen.getByLabelText("New password"));
  await user.type(screen.getByLabelText("New password"), password);
  await user.clear(screen.getByLabelText("Confirm password"));
  await user.type(screen.getByLabelText("Confirm password"), confirm);
  await user.click(screen.getByRole("button", { name: "Update password" }));
}

describe("the reset link", () => {
  test("shows an expired state when the URL has no token_hash", () => {
    search.current = new URLSearchParams();
    render(<ResetForm />);
    expect(
      screen.getByText("This reset link has expired or was already used."),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Request a new link" })).toHaveAttribute(
      "href",
      "/forgot-password",
    );
    expect(checkMock).not.toHaveBeenCalled();
  });

  test("checks the link once on load", async () => {
    await renderReady();
    expect(checkMock).toHaveBeenCalledTimes(1);
    expect(checkMock).toHaveBeenCalledWith("abc");
  });

  test("shows a checking state while the link is verified", () => {
    checkMock.mockReturnValue(new Promise(() => {}));
    render(<ResetForm />);
    expect(screen.getByText("Checking your link…")).toBeInTheDocument();
  });

  test("shows the expired state when the backend refuses the link", async () => {
    checkMock.mockResolvedValue({
      ok: false,
      code: "link_expired",
      message: "Link expired",
    });
    render(<ResetForm />);
    expect(
      await screen.findByText("This reset link has expired or was already used."),
    ).toBeInTheDocument();
    expect(screen.queryByLabelText("New password")).not.toBeInTheDocument();
  });

  test("explains a rate limit while checking the link", async () => {
    checkMock.mockResolvedValue({
      ok: false,
      code: "rate_limited",
      message: "Too many",
      retryAfterSeconds: 600,
    });
    render(<ResetForm />);
    expect(
      await screen.findByText("Too many attempts. Try again in 10 minutes."),
    ).toBeInTheDocument();
  });

  test("names the account being reset", async () => {
    await renderReady();
    expect(
      screen.getByText("Resetting the password for tope@afterhours.studio"),
    ).toBeInTheDocument();
  });
});

describe("the new password", () => {
  test("marks each rule as met while typing", async () => {
    const user = await renderReady();
    expect(row("A number")).toHaveAttribute("data-state", "unmet");

    await user.type(screen.getByLabelText("New password"), "abcdefghi1!");
    expect(row("10+ characters")).toHaveAttribute("data-state", "met");
    expect(row("A number")).toHaveAttribute("data-state", "met");
    expect(row("A symbol")).toHaveAttribute("data-state", "met");
    expect(row("Not used before")).toHaveAttribute("data-state", "unmet");
  });

  test("blocks a password that misses the rules", async () => {
    const user = await renderReady();
    await submit(user, "short", "short");
    expect(
      await screen.findByText("Use at least 10 characters, with a number and a symbol."),
    ).toBeInTheDocument();
    expect(setPasswordMock).not.toHaveBeenCalled();
  });

  test("blocks when the confirmation does not match", async () => {
    const user = await renderReady();
    await submit(user, "brand-new-pass-9#", "brand-new-pass-8#");
    expect(await screen.findByText("Passwords don't match.")).toBeInTheDocument();
    expect(setPasswordMock).not.toHaveBeenCalled();
  });

  test("fails 'not used before' when the backend refuses the password", async () => {
    setPasswordMock.mockResolvedValue({
      ok: false,
      code: "password_refused",
      message: "New password must differ from the current one",
    });
    const user = await renderReady();
    await submit(user, "same-as-now-1!", "same-as-now-1!");
    expect(
      await screen.findByText("New password must differ from the current one"),
    ).toBeInTheDocument();
    expect(row("Not used before")).toHaveAttribute("data-state", "failed");
    expect(push).not.toHaveBeenCalled();
  });

  test("sends the password and goes to sign-in", async () => {
    const user = await renderReady();
    await submit(user, "brand-new-pass-9#", "brand-new-pass-9#");
    await vi.waitFor(() => expect(push).toHaveBeenCalledWith("/sign-in?reset=1"));
    expect(setPasswordMock).toHaveBeenCalledWith("brand-new-pass-9#", true);
  });

  test("signs out other devices unless the box is cleared", async () => {
    const user = await renderReady();
    const box = screen.getByRole("checkbox", { name: "Sign out of other devices" });
    expect(box).toBeChecked();
    await user.click(box);
    await submit(user, "brand-new-pass-9#", "brand-new-pass-9#");
    await vi.waitFor(() => expect(setPasswordMock).toHaveBeenCalled());
    expect(setPasswordMock).toHaveBeenCalledWith("brand-new-pass-9#", false);
  });

  test("falls back to the expired state when the reset session lapses", async () => {
    setPasswordMock.mockResolvedValue({
      ok: false,
      code: "session_expired",
      message: "Unauthorized",
    });
    const user = await renderReady();
    await submit(user, "brand-new-pass-9#", "brand-new-pass-9#");
    expect(
      await screen.findByText("Your reset session expired. Request a new link."),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Request a new link" })).toBeInTheDocument();
  });
});
