import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { readEmail, writeEmail } from "./email-state";

beforeEach(() => sessionStorage.clear());
afterEach(() => vi.restoreAllMocks());

describe("email-state", () => {
  test("round-trips an email", () => {
    writeEmail("tope@afterhours.studio");
    expect(readEmail()).toBe("tope@afterhours.studio");
  });

  test("returns an empty string when nothing is stored", () => {
    expect(readEmail()).toBe("");
  });

  test("returns an empty string when storage throws on read", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    expect(readEmail()).toBe("");
  });

  test("does not throw when storage throws on write", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    expect(() => writeEmail("a@b.co")).not.toThrow();
  });
});
