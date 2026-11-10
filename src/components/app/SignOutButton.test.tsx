import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { SignOutButton } from "./SignOutButton";

const replace = vi.hoisted(() => vi.fn());
const signOutMock = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({ useRouter: () => ({ replace }) }));
vi.mock("@/lib/auth/api", () => ({ signOut: signOutMock }));

beforeEach(() => {
  replace.mockClear();
  signOutMock.mockReset();
  signOutMock.mockResolvedValue({ ok: true, data: undefined });
});

describe("SignOutButton", () => {
  test("signs out and goes to the sign-in page", async () => {
    const user = userEvent.setup();
    render(<SignOutButton />);
    await user.click(screen.getByRole("button", { name: "Sign out" }));
    await vi.waitFor(() => expect(replace).toHaveBeenCalledWith("/sign-in"));
    expect(signOutMock).toHaveBeenCalledTimes(1);
  });

  test("a double click signs out once", async () => {
    let release!: (value: unknown) => void;
    signOutMock.mockReturnValue(new Promise((resolve) => (release = resolve)));
    const user = userEvent.setup();
    render(<SignOutButton />);
    const button = screen.getByRole("button", { name: "Sign out" });
    await user.dblClick(button);
    expect(signOutMock).toHaveBeenCalledTimes(1);
    expect(button).toHaveAttribute("aria-busy", "true");
    release({ ok: true, data: undefined });
    await vi.waitFor(() => expect(replace).toHaveBeenCalledTimes(1));
  });

  test("when the request fails it stays put, says so, and can be retried", async () => {
    signOutMock.mockResolvedValueOnce({
      ok: false,
      code: "network",
      message: "Couldn't reach the server. Try again.",
    });
    const user = userEvent.setup();
    render(<SignOutButton />);
    await user.click(screen.getByRole("button", { name: "Sign out" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Couldn't sign out. Try again.",
    );
    expect(replace).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "Sign out" }));
    await vi.waitFor(() => expect(replace).toHaveBeenCalledWith("/sign-in"));
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
