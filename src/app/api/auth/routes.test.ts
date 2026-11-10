import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

type Stored = { value: string; options: Record<string, unknown> };
const store = vi.hoisted(() => new Map<string, Stored>());
const fetchMock = vi.hoisted(() => vi.fn());

vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) =>
      store.has(name) ? { name, value: store.get(name)!.value } : undefined,
    set: (name: string, value: string, options: Record<string, unknown> = {}) => {
      store.set(name, { value, options });
    },
    delete: (name: string) => {
      store.delete(name);
    },
  }),
}));

import { POST as forgot } from "./forgot-password/route";
import { POST as login } from "./login/route";
import { POST as logout } from "./logout/route";
import { POST as register } from "./register/route";
import { POST as resend } from "./resend/route";
import { POST as resetPassword } from "./reset-password/route";
import { POST as resetVerify } from "./reset-password/verify/route";
import { POST as verify } from "./verify/route";

const now = () => Math.floor(Date.now() / 1000);
const signedIn = () => ({
  accessToken: "at-1",
  refreshToken: "rt-1",
  expiresAt: now() + 3600,
  user: { id: "u1", email: "tope@afterhours.studio" },
  roles: ["organizer"],
  isAdmin: false,
  workspace: { id: "w1", name: "Afterhours studio" },
  data: [],
});

function req(body: unknown, headers: Record<string, string> = {}) {
  return new Request("http://localhost/api/auth/x", {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
}
const json = (body: unknown, init: ResponseInit = {}) =>
  new Response(JSON.stringify(body), {
    headers: { "content-type": "application/json" },
    ...init,
  });

beforeEach(() => {
  store.clear();
  fetchMock.mockReset();
  vi.stubEnv("BACKEND_URL", "http://backend.test");
  vi.stubGlobal("fetch", fetchMock);
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("login", () => {
  test("sets httpOnly session cookies and never returns tokens", async () => {
    fetchMock.mockResolvedValue(json(signedIn()));
    const res = await login(req({ email: "a@b.co", password: "pw" }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).not.toHaveProperty("accessToken");
    expect(body).not.toHaveProperty("refreshToken");
    expect(body.workspace).toEqual({ id: "w1", name: "Afterhours studio" });

    const at = store.get("exper_at")!;
    expect(at.value).toBe("at-1");
    expect(at.options).toMatchObject({ httpOnly: true, sameSite: "lax", path: "/" });
    expect(at.options.maxAge as number).toBeGreaterThan(3500);
    expect(at.options.maxAge as number).toBeLessThanOrEqual(3600);
    expect(store.get("exper_rt")!.value).toBe("rt-1");
    expect(store.get("exper_rt")!.options).toMatchObject({ httpOnly: true });
  });

  test("passes a 401 through with its message and sets no cookies", async () => {
    fetchMock.mockResolvedValue(
      json({ statusCode: 401, message: "Invalid email or password" }, { status: 401 }),
    );
    const res = await login(req({ email: "a@b.co", password: "bad" }));
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ message: "Invalid email or password" });
    expect(store.size).toBe(0);
  });

  test("passes Retry-After through on a 429", async () => {
    fetchMock.mockResolvedValue(
      json({ message: "Too many" }, { status: 429, headers: { "retry-after": "300", "content-type": "application/json" } }),
    );
    const res = await login(req({ email: "a@b.co", password: "bad" }));
    expect(res.status).toBe(429);
    expect(res.headers.get("retry-after")).toBe("300");
  });

  test("rejects a request that is not JSON", async () => {
    const res = await login(
      new Request("http://localhost/api/auth/login", {
        method: "POST",
        headers: { "content-type": "text/plain" },
        body: "email=a",
      }),
    );
    expect(res.status).toBe(415);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  test("forwards the browser user agent to the backend", async () => {
    fetchMock.mockResolvedValue(json(signedIn()));
    await login(req({ email: "a@b.co", password: "pw" }, { "user-agent": "Mozilla/5.0 (Mac)" }));
    expect(fetchMock.mock.calls[0][1].headers["user-agent"]).toContain("Mozilla/5.0 (Mac)");
  });
});

describe("register", () => {
  test("proxies to the organizer register route and keeps 201", async () => {
    fetchMock.mockResolvedValue(
      json({ message: "Check your email for a verification code" }, { status: 201 }),
    );
    const payload = {
      fullName: "Tope Adewale",
      email: "tope@afterhours.studio",
      workspaceName: "Afterhours studio",
      password: "a-strong-pass-1!",
      acceptedTerms: true,
    };
    const res = await register(req(payload));
    expect(res.status).toBe(201);
    expect(fetchMock.mock.calls[0][0]).toBe("http://backend.test/api/v1/organizer/auth/register");
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual(payload);
    expect(store.size).toBe(0);
  });

  test("passes a 409 through", async () => {
    fetchMock.mockResolvedValue(
      json({ message: "An account with this email already exists" }, { status: 409 }),
    );
    const res = await register(req({ email: "a@b.co" }));
    expect(res.status).toBe(409);
    expect((await res.json()).message).toBe("An account with this email already exists");
  });
});

describe("verify", () => {
  test("signs the person in with cookies", async () => {
    fetchMock.mockResolvedValue(json(signedIn()));
    const res = await verify(req({ email: "a@b.co", token: "123456" }));
    expect(res.status).toBe(200);
    expect(fetchMock.mock.calls[0][0]).toBe("http://backend.test/api/v1/organizer/auth/verify");
    expect(store.get("exper_at")!.value).toBe("at-1");
    expect(await res.json()).not.toHaveProperty("accessToken");
  });

  test("a wrong code sets nothing", async () => {
    fetchMock.mockResolvedValue(json({ message: "Invalid or expired code" }, { status: 400 }));
    const res = await verify(req({ email: "a@b.co", token: "000000" }));
    expect(res.status).toBe(400);
    expect(store.size).toBe(0);
  });
});

describe("resend and forgot-password", () => {
  test("resend calls /auth/resend-otp", async () => {
    fetchMock.mockResolvedValue(json({ message: "sent" }));
    const res = await resend(req({ email: "a@b.co" }));
    expect(res.status).toBe(200);
    expect(fetchMock.mock.calls[0][0]).toBe("http://backend.test/api/v1/auth/resend-otp");
  });

  test("forgot-password answers 204 with no body", async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }));
    const res = await forgot(req({ email: "a@b.co" }));
    expect(res.status).toBe(204);
    expect(await res.text()).toBe("");
  });
});

describe("password reset", () => {
  const recovery = () => ({
    accessToken: "rec-at",
    refreshToken: "rec-rt",
    expiresAt: now() + 3600,
    email: "tope@afterhours.studio",
  });

  test("verify keeps the recovery session private and returns only the email", async () => {
    fetchMock.mockResolvedValue(json(recovery()));
    const res = await resetVerify(req({ tokenHash: "hash" }));
    expect(await res.json()).toEqual({ email: "tope@afterhours.studio" });
    expect(store.has("exper_at")).toBe(false);
    const cookie = store.get("exper_recovery")!;
    expect(cookie.options).toMatchObject({ httpOnly: true, sameSite: "lax" });
    expect(cookie.options.maxAge as number).toBeLessThanOrEqual(600);
    expect(cookie.value).not.toBe("");
  });

  test("an expired link sets nothing", async () => {
    fetchMock.mockResolvedValue(json({ message: "Link expired" }, { status: 400 }));
    const res = await resetVerify(req({ tokenHash: "old" }));
    expect(res.status).toBe(400);
    expect(store.size).toBe(0);
  });

  test("setting a password without a recovery session answers 401", async () => {
    const res = await resetPassword(req({ newPassword: "x-strong-pass-1!" }));
    expect(res.status).toBe(401);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  test("a refused password keeps the recovery session for another try", async () => {
    fetchMock.mockResolvedValueOnce(json(recovery()));
    await resetVerify(req({ tokenHash: "hash" }));
    fetchMock.mockResolvedValueOnce(json({ message: "Same as current password" }, { status: 400 }));

    const res = await resetPassword(req({ newPassword: "same-as-now-1!" }));
    expect(res.status).toBe(400);
    expect(store.has("exper_recovery")).toBe(true);
    expect(store.has("exper_at")).toBe(false);
  });

  test("success promotes the recovery tokens to the session", async () => {
    fetchMock.mockResolvedValueOnce(json(recovery()));
    await resetVerify(req({ tokenHash: "hash" }));
    fetchMock.mockResolvedValueOnce(
      json({ passwordUpdated: true, user: { id: "u1" }, roles: ["organizer"], isAdmin: false, workspace: null, data: [] }),
    );

    const res = await resetPassword(
      req({ newPassword: "another-strong-1!", signOutOtherDevices: true }),
    );
    const [url, init] = fetchMock.mock.calls[1];
    expect(url).toBe("http://backend.test/api/v1/organizer/auth/reset-password");
    expect(init.headers.authorization).toBe("Bearer rec-at");
    expect(JSON.parse(init.body)).toEqual({
      newPassword: "another-strong-1!",
      signOutOtherDevices: true,
    });

    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ passwordUpdated: true });
    expect(store.get("exper_at")!.value).toBe("rec-at");
    expect(store.get("exper_rt")!.value).toBe("rec-rt");
    expect(store.has("exper_recovery")).toBe(false);
  });

  test("an expired recovery session is cleared on 401", async () => {
    fetchMock.mockResolvedValueOnce(json(recovery()));
    await resetVerify(req({ tokenHash: "hash" }));
    fetchMock.mockResolvedValueOnce(json({ message: "Unauthorized" }, { status: 401 }));

    const res = await resetPassword(req({ newPassword: "another-strong-1!" }));
    expect(res.status).toBe(401);
    expect(store.has("exper_recovery")).toBe(false);
  });
});

describe("logout", () => {
  const signedInCookies = () => {
    store.set("exper_at", { value: "at-1", options: {} });
    store.set("exper_rt", { value: "rt-1", options: {} });
    store.set("exper_recovery", { value: "{}", options: {} });
  };
  const cookiesLeft = () =>
    ["exper_at", "exper_rt", "exper_recovery"].filter((name) => store.has(name));

  test("ends the session on the backend with the access token and clears every cookie", async () => {
    signedInCookies();
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }));

    const res = await logout(req({}));

    expect(res.status).toBe(204);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("http://backend.test/api/v1/auth/sign-out");
    expect(init.method).toBe("POST");
    expect(init.headers.authorization).toBe("Bearer at-1");
    expect(cookiesLeft()).toEqual([]);
  });

  test("still clears the cookies when the backend refuses", async () => {
    signedInCookies();
    fetchMock.mockResolvedValue(json({ message: "Unauthorized" }, { status: 401 }));
    const res = await logout(req({}));
    expect(res.status).toBe(204);
    expect(cookiesLeft()).toEqual([]);
  });

  test("still clears the cookies when the backend is unreachable", async () => {
    signedInCookies();
    fetchMock.mockRejectedValue(new TypeError("fetch failed"));
    const res = await logout(req({}));
    expect(res.status).toBe(204);
    expect(cookiesLeft()).toEqual([]);
  });

  test("with no session it does not call the backend", async () => {
    const res = await logout(req({}));
    expect(res.status).toBe(204);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  test("refuses a non-JSON request and leaves the session alone", async () => {
    signedInCookies();
    const form = new Request("http://localhost/api/auth/logout", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: "a=b",
    });
    const res = await logout(form);
    expect(res.status).toBe(415);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(cookiesLeft()).toEqual(["exper_at", "exper_rt", "exper_recovery"]);
  });
});
