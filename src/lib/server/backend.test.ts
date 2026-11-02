import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { backendFetch } from "./backend";

const fetchMock = vi.fn();

beforeEach(() => {
  vi.stubEnv("BACKEND_URL", "http://backend.test");
  vi.stubGlobal("fetch", fetchMock);
  fetchMock.mockReset();
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

function json(body: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(body), {
    headers: { "content-type": "application/json" },
    ...init,
  });
}

describe("backendFetch", () => {
  test("calls /api/v1 on the backend with JSON, bearer and user agent", async () => {
    fetchMock.mockResolvedValue(json({ ok: 1 }));
    await backendFetch("/organizer/auth/login", {
      method: "POST",
      body: { email: "a@b.co" },
      bearer: "tok",
      userAgent: "Mozilla/5.0 (Mac)",
    });
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("http://backend.test/api/v1/organizer/auth/login");
    expect(init.method).toBe("POST");
    expect(init.body).toBe(JSON.stringify({ email: "a@b.co" }));
    expect(init.headers["content-type"]).toBe("application/json");
    expect(init.headers.authorization).toBe("Bearer tok");
    expect(init.headers["user-agent"]).toMatch(/^Exper-Organizer\/\S+ \(.*Mozilla\/5\.0 \(Mac\).*\)$/);
  });

  test("ignores a trailing slash on BACKEND_URL", async () => {
    vi.stubEnv("BACKEND_URL", "http://backend.test/");
    fetchMock.mockResolvedValue(json({}));
    await backendFetch("/auth/refresh", { method: "POST" });
    expect(fetchMock.mock.calls[0][0]).toBe("http://backend.test/api/v1/auth/refresh");
  });

  test("returns parsed data on success", async () => {
    fetchMock.mockResolvedValue(json({ email: "a@b.co" }, { status: 200 }));
    expect(await backendFetch("/x", { method: "POST" })).toEqual({
      ok: true,
      status: 200,
      data: { email: "a@b.co" },
    });
  });

  test("treats 204 as success with no data", async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }));
    expect(await backendFetch("/x", { method: "POST" })).toMatchObject({
      ok: true,
      status: 204,
    });
  });

  test("joins a list of validation messages", async () => {
    fetchMock.mockResolvedValue(
      json(
        { statusCode: 400, message: ["email must be an email", "password too short"] },
        { status: 400 },
      ),
    );
    expect(await backendFetch("/x", { method: "POST" })).toEqual({
      ok: false,
      status: 400,
      message: "email must be an email. password too short",
    });
  });

  test("keeps a single string message and reads Retry-After seconds", async () => {
    fetchMock.mockResolvedValue(
      json(
        { statusCode: 429, message: "Too many requests" },
        { status: 429, headers: { "retry-after": "120", "content-type": "application/json" } },
      ),
    );
    expect(await backendFetch("/x", { method: "POST" })).toEqual({
      ok: false,
      status: 429,
      message: "Too many requests",
      retryAfter: 120,
    });
  });

  test("falls back to a generic message for a non-JSON error", async () => {
    fetchMock.mockResolvedValue(new Response("<html>bad gateway</html>", { status: 502 }));
    const result = await backendFetch("/x", { method: "POST" });
    expect(result).toMatchObject({ ok: false, status: 502 });
    expect(result.ok === false && result.message).toBeTruthy();
  });

  test("answers 502 when the backend cannot be reached", async () => {
    fetchMock.mockRejectedValue(new TypeError("fetch failed"));
    expect(await backendFetch("/x", { method: "POST" })).toMatchObject({
      ok: false,
      status: 502,
    });
  });

  test("answers 500 when BACKEND_URL is not configured", async () => {
    vi.stubEnv("BACKEND_URL", "");
    expect(await backendFetch("/x", { method: "POST" })).toMatchObject({
      ok: false,
      status: 500,
      message: expect.stringContaining("not configured"),
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
