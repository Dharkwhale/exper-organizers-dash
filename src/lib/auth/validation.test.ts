import { describe, expect, test } from "vitest";
import {
  isEmail,
  normalizeEmail,
  passwordChecks,
  passwordStrength,
} from "./validation";

describe("isEmail", () => {
  test("accepts an address with surrounding whitespace and mixed case", () => {
    expect(isEmail(" Tope@AfterHours.studio ")).toBe(true);
  });
  test("rejects a missing domain", () => {
    expect(isEmail("tope@")).toBe(false);
  });
  test("rejects an empty string", () => {
    expect(isEmail("")).toBe(false);
  });
});

describe("normalizeEmail", () => {
  test("trims and lowercases", () => {
    expect(normalizeEmail(" Tope@AfterHours.studio ")).toBe(
      "tope@afterhours.studio",
    );
  });
});

describe("passwordChecks", () => {
  test("fails every check for a short plain password", () => {
    expect(passwordChecks("abc")).toEqual({
      length: false,
      number: false,
      symbol: false,
    });
  });
  test("passes every check for a long password with a number and symbol", () => {
    expect(passwordChecks("abcdefghi1!")).toEqual({
      length: true,
      number: true,
      symbol: true,
    });
  });
  test("counts emoji as one visible character each", () => {
    expect(passwordChecks("😀".repeat(9) + "1!").length).toBe(true);
    expect(passwordChecks("😀".repeat(5)).length).toBe(false);
  });
});

describe("passwordStrength", () => {
  test("is empty for an empty string", () => {
    expect(passwordStrength("")).toBe("empty");
  });
  test("is weak when any check fails", () => {
    expect(passwordStrength("abcdefghij")).toBe("weak");
  });
  test("is okay when all checks pass at 10-11 characters", () => {
    expect(passwordStrength("abcdefghi1!")).toBe("okay");
  });
  test("is strong when all checks pass at 12+ characters", () => {
    expect(passwordStrength("abcdefghijk1!")).toBe("strong");
  });
  test("does not throw for emoji input", () => {
    expect(() => passwordStrength("😀😀😀")).not.toThrow();
  });
});
