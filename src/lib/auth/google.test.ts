import { createHash } from "node:crypto";
import { beforeEach, describe, expect, test, vi } from "vitest";

const SRC = "https://accounts.google.com/gsi/client";
type WithGoogle = { google?: unknown };
const win = window as unknown as WithGoogle;

beforeEach(() => {
  vi.resetModules();
  document.head.innerHTML = "";
  delete win.google;
});

describe("createNonce", () => {
  test("returns a random raw nonce and its SHA-256 hex hash", async () => {
    const { createNonce } = await import("./google");
    const { raw, hashed } = await createNonce();
    expect(raw).toMatch(/^[0-9a-f]{64}$/);
    expect(hashed).toBe(createHash("sha256").update(raw).digest("hex"));
    expect((await createNonce()).raw).not.toBe(raw);
  });
});

describe("loadGoogleIdentity", () => {
  test("adds the Google script once and resolves when it loads", async () => {
    const { loadGoogleIdentity } = await import("./google");
    const first = loadGoogleIdentity();
    const second = loadGoogleIdentity();
    const scripts = document.querySelectorAll(`script[src="${SRC}"]`);
    expect(scripts).toHaveLength(1);

    const fake = { accounts: { id: { initialize: vi.fn(), renderButton: vi.fn() } } };
    win.google = fake;
    scripts[0].dispatchEvent(new Event("load"));
    await expect(first).resolves.toBe(fake);
    await expect(second).resolves.toBe(fake);
  });

  test("resolves straight away when Google is already on the page", async () => {
    const fake = { accounts: { id: { initialize: vi.fn(), renderButton: vi.fn() } } };
    win.google = fake;
    const { loadGoogleIdentity } = await import("./google");
    await expect(loadGoogleIdentity()).resolves.toBe(fake);
    expect(document.querySelectorAll("script")).toHaveLength(0);
  });

  test("rejects when the script fails to load, and a later call tries again", async () => {
    const { loadGoogleIdentity } = await import("./google");
    const failed = loadGoogleIdentity();
    document.querySelector(`script[src="${SRC}"]`)!.dispatchEvent(new Event("error"));
    await expect(failed).rejects.toThrow();

    const retry = loadGoogleIdentity();
    expect(document.querySelectorAll(`script[src="${SRC}"]`)).toHaveLength(1);
    const fake = { accounts: { id: { initialize: vi.fn(), renderButton: vi.fn() } } };
    win.google = fake;
    document.querySelector(`script[src="${SRC}"]`)!.dispatchEvent(new Event("load"));
    await expect(retry).resolves.toBe(fake);
  });
});
