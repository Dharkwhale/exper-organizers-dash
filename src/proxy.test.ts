// @vitest-environment node
import { NextRequest } from "next/server";
import { describe, expect, test } from "vitest";
import { config, proxy } from "./proxy";

const request = (cookie?: string) =>
  new NextRequest("http://localhost:3000/overview", {
    headers: cookie ? { cookie } : {},
  });

describe("proxy", () => {
  test("sends a visitor with no session cookie to sign in", () => {
    const response = proxy(request());
    expect(response.status).toBe(307);
    expect(new URL(response.headers.get("location")!).pathname).toBe("/sign-in");
  });

  test("lets a visitor with a session cookie through", () => {
    const response = proxy(request("exper_at=abc"));
    expect(response.headers.get("location")).toBeNull();
    expect(response.status).toBe(200);
  });

  test("guards the overview and events areas", () => {
    expect(config.matcher).toEqual(["/overview/:path*", "/events/:path*"]);
  });
});
