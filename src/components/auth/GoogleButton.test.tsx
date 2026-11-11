import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { GoogleButton } from "./GoogleButton";

const g = vi.hoisted(() => ({
  load: vi.fn(),
  initialize: vi.fn(),
  renderButton: vi.fn(),
}));

vi.mock("@/lib/auth/google", () => ({
  loadGoogleIdentity: g.load,
  createNonce: async () => ({ raw: "raw-nonce", hashed: "hashed-nonce" }),
}));

beforeEach(() => {
  g.load.mockReset();
  g.initialize.mockReset();
  g.renderButton.mockReset();
  g.load.mockResolvedValue({
    accounts: { id: { initialize: g.initialize, renderButton: g.renderButton } },
  });
  vi.stubEnv("NEXT_PUBLIC_GOOGLE_CLIENT_ID", "client-123");
});
afterEach(() => vi.unstubAllEnvs());

describe("GoogleButton", () => {
  test("without a client ID it is the disabled placeholder and never loads Google", () => {
    vi.stubEnv("NEXT_PUBLIC_GOOGLE_CLIENT_ID", "");
    render(<GoogleButton verb="Sign in" onCredential={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Sign in with Google" })).toHaveAttribute(
      "aria-disabled",
      "true",
    );
    expect(g.load).not.toHaveBeenCalled();
  });

  test("with a client ID it sets Google up with the hashed nonce and draws its button", async () => {
    render(<GoogleButton verb="Sign in" onCredential={vi.fn()} />);
    await vi.waitFor(() => expect(g.renderButton).toHaveBeenCalled());
    expect(g.initialize).toHaveBeenCalledWith(
      expect.objectContaining({
        client_id: "client-123",
        nonce: "hashed-nonce",
        callback: expect.any(Function),
      }),
    );
    const [element, options] = g.renderButton.mock.calls[0];
    expect(element).toBeInstanceOf(HTMLElement);
    expect(options).toMatchObject({ theme: "filled_black", shape: "pill", text: "signin_with" });
  });

  test("on sign-up the Google button says 'Sign up with'", async () => {
    render(<GoogleButton verb="Sign up" onCredential={vi.fn()} />);
    await vi.waitFor(() => expect(g.renderButton).toHaveBeenCalled());
    expect(g.renderButton.mock.calls[0][1]).toMatchObject({ text: "signup_with" });
  });

  test("hands the ID token and the raw nonce to onCredential", async () => {
    const onCredential = vi.fn();
    render(<GoogleButton verb="Sign in" onCredential={onCredential} />);
    await vi.waitFor(() => expect(g.initialize).toHaveBeenCalled());
    g.initialize.mock.calls[0][0].callback({ credential: "g-tok" });
    expect(onCredential).toHaveBeenCalledWith({ idToken: "g-tok", nonce: "raw-nonce" });
  });

  test("ignores a response with no credential", async () => {
    const onCredential = vi.fn();
    render(<GoogleButton verb="Sign in" onCredential={onCredential} />);
    await vi.waitFor(() => expect(g.initialize).toHaveBeenCalled());
    g.initialize.mock.calls[0][0].callback({});
    expect(onCredential).not.toHaveBeenCalled();
  });

  test("when disabled it shows the placeholder with the reason and draws nothing", async () => {
    render(
      <GoogleButton
        verb="Sign up"
        onCredential={vi.fn()}
        disabled
        hint="Add your workspace name first."
      />,
    );
    expect(screen.getByRole("button", { name: "Sign up with Google" })).toHaveAttribute(
      "aria-disabled",
      "true",
    );
    expect(screen.getByText("Add your workspace name first.")).toBeInTheDocument();
    await Promise.resolve();
    expect(g.renderButton).not.toHaveBeenCalled();
  });

  test("when Google can't be loaded it falls back to the placeholder and says so", async () => {
    g.load.mockRejectedValue(new Error("blocked"));
    render(<GoogleButton verb="Sign in" onCredential={vi.fn()} />);
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Couldn't load Google sign-in. Try again later.",
    );
    expect(screen.getByRole("button", { name: "Sign in with Google" })).toHaveAttribute(
      "aria-disabled",
      "true",
    );
  });
});
