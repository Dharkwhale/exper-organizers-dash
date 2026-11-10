import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import {
  checkResetLink,
  friendlyMessage,
  requestReset,
  resendCode,
  setPassword,
  signIn,
  signOut,
  signUp,
  verifyCode,
} from "./api";

const fetchMock = vi.fn();

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});
afterEach(() => vi.unstubAllGlobals());

const reply = (status: number, body?: unknown, headers: Record<string, string> = {}) =>
  new Response(body === undefined ? null : JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", ...headers },
  });

const signedIn = {
  user: { id: "u1", email: "tope@afterhours.studio" },
  roles: ["organizer"],
  isAdmin: false,
  workspace: { id: "w1", name: "Afterhours studio" },
  data: [],
};

describe("requests", () => {
  test("signIn posts JSON to the same-origin route", async () => {
    fetchMock.mockResolvedValue(reply(200, signedIn));
    await signIn("tope@afterhours.studio", "pw");
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/auth/login");
    expect(init.method).toBe("POST");
    expect(init.headers["content-type"]).toBe("application/json");
    expect(JSON.parse(init.body)).toEqual({
      email: "tope@afterhours.studio",
      password: "pw",
    });
  });

  test("signUp sends the organizer fields", async () => {
    fetchMock.mockResolvedValue(reply(201, { message: "ok" }));
    await signUp({
      fullName: "Tope Adewale",
      email: "tope@afterhours.studio",
      workspaceName: "Afterhours studio",
      password: "a-strong-pass-1!",
      acceptedTerms: true,
    });
    expect(fetchMock.mock.calls[0][0]).toBe("/api/auth/register");
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toMatchObject({
      workspaceName: "Afterhours studio",
      acceptedTerms: true,
    });
  });

  test("verifyCode, resendCode, requestReset, checkResetLink and setPassword hit their routes", async () => {
    fetchMock.mockImplementation(async () => reply(200, signedIn));
    await verifyCode("a@b.co", "123456");
    await resendCode("a@b.co");
    await requestReset("a@b.co");
    await checkResetLink("hash");
    await setPassword("another-strong-1!", true);
    expect(fetchMock.mock.calls.map((c) => c[0])).toEqual([
      "/api/auth/verify",
      "/api/auth/resend",
      "/api/auth/forgot-password",
      "/api/auth/reset-password/verify",
      "/api/auth/reset-password",
    ]);
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({
      email: "a@b.co",
      token: "123456",
    });
    expect(JSON.parse(fetchMock.mock.calls[3][1].body)).toEqual({ tokenHash: "hash" });
    expect(JSON.parse(fetchMock.mock.calls[4][1].body)).toEqual({
      newPassword: "another-strong-1!",
      signOutOtherDevices: true,
    });
  });
});

describe("friendlyMessage", () => {
  const limited = (retryAfterSeconds?: number) =>
    ({ ok: false, code: "rate_limited", message: "Too many", retryAfterSeconds }) as const;

  test("turns a rate limit into minutes", () => {
    expect(friendlyMessage(limited(300))).toBe("Too many attempts. Try again in 5 minutes.");
  });
  test("rounds up and never says zero minutes", () => {
    expect(friendlyMessage(limited(30))).toBe("Too many attempts. Try again in 1 minute.");
    expect(friendlyMessage(limited(61))).toBe("Too many attempts. Try again in 2 minutes.");
  });
  test("says later when no delay is known", () => {
    expect(friendlyMessage(limited())).toBe("Too many attempts. Try again later.");
  });
  test("passes every other message through", () => {
    expect(
      friendlyMessage({ ok: false, code: "network", message: "Couldn't reach the server. Try again." }),
    ).toBe("Couldn't reach the server. Try again.");
  });
});

describe("results", () => {
  test("a successful sign-in returns the session summary", async () => {
    fetchMock.mockResolvedValue(reply(200, signedIn));
    const result = await signIn("a@b.co", "pw");
    expect(result).toEqual({ ok: true, data: signedIn });
  });

  test("a 204 is a success with no data", async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }));
    expect(await requestReset("a@b.co")).toMatchObject({ ok: true });
  });

  test("401 on login is invalid credentials", async () => {
    fetchMock.mockResolvedValue(reply(401, { message: "Invalid email or password" }));
    expect(await signIn("a@b.co", "bad")).toEqual({
      ok: false,
      code: "invalid_credentials",
      message: "Invalid email or password",
    });
  });

  test("403 splits into unverified email and not an organizer", async () => {
    fetchMock.mockResolvedValueOnce(
      reply(403, { message: "Email not verified. Request a new code via /auth/resend-otp" }),
    );
    expect(await signIn("a@b.co", "pw")).toMatchObject({ code: "not_verified" });
    fetchMock.mockResolvedValueOnce(reply(403, { message: "This account is not an organizer" }));
    expect(await signIn("a@b.co", "pw")).toMatchObject({ code: "not_organizer" });
  });

  test("429 carries the retry delay in seconds", async () => {
    fetchMock.mockResolvedValue(reply(429, { message: "Too many" }, { "retry-after": "300" }));
    expect(await signIn("a@b.co", "pw")).toEqual({
      ok: false,
      code: "rate_limited",
      message: "Too many",
      retryAfterSeconds: 300,
    });
  });

  test("409 on register is email_taken", async () => {
    fetchMock.mockResolvedValue(
      reply(409, { message: "An account with this email already exists" }),
    );
    const result = await signUp({
      fullName: "T A",
      email: "a@b.co",
      workspaceName: "Ws",
      password: "a-strong-pass-1!",
      acceptedTerms: true,
    });
    expect(result).toMatchObject({ ok: false, code: "email_taken" });
  });

  test("400 on verify is a bad code and on a reset link is an expired link", async () => {
    fetchMock.mockResolvedValueOnce(reply(400, { message: "Invalid or expired code" }));
    expect(await verifyCode("a@b.co", "000000")).toMatchObject({ code: "bad_code" });
    fetchMock.mockResolvedValueOnce(reply(400, { message: "Link expired" }));
    expect(await checkResetLink("old")).toMatchObject({ code: "link_expired" });
  });

  test("setPassword maps 400 to a refused password and 401 to an expired session", async () => {
    fetchMock.mockResolvedValueOnce(reply(400, { message: "Same as current password" }));
    expect(await setPassword("x-strong-pass-1!", true)).toMatchObject({
      ok: false,
      code: "password_refused",
    });
    fetchMock.mockResolvedValueOnce(reply(401, { message: "Unauthorized" }));
    expect(await setPassword("x-strong-pass-1!", true)).toMatchObject({
      code: "session_expired",
    });
  });

  test("a network failure reads as a friendly message", async () => {
    fetchMock.mockRejectedValue(new TypeError("Failed to fetch"));
    expect(await signIn("a@b.co", "pw")).toMatchObject({
      ok: false,
      code: "network",
      message: expect.stringMatching(/try again/i),
    });
  });

  test("an unreadable error body still gives a message", async () => {
    fetchMock.mockResolvedValue(new Response("oops", { status: 500 }));
    const result = await signIn("a@b.co", "pw");
    expect(result).toMatchObject({ ok: false, code: "unknown" });
    expect(result.ok === false && result.message).toBeTruthy();
  });
});

describe("signOut", () => {
  test("posts an empty JSON body to the logout route and succeeds on 204", async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }));
    const result = await signOut();
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/auth/logout");
    expect(init.method).toBe("POST");
    expect(init.headers["content-type"]).toBe("application/json");
    expect(JSON.parse(init.body)).toEqual({});
    expect(result).toEqual({ ok: true, data: undefined });
  });

  test("a network failure reads as a friendly message", async () => {
    fetchMock.mockRejectedValue(new TypeError("fetch failed"));
    expect(await signOut()).toMatchObject({
      ok: false,
      code: "network",
      message: "Couldn't reach the server. Try again.",
    });
  });
});
