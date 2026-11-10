import { describe, expect, test } from "vitest";
import { sparklinePath } from "./sparkline";

const points = (d: string) =>
  d
    .split(/[ML]/)
    .filter(Boolean)
    .map((pair) => pair.split(",").map(Number) as [number, number]);

describe("sparklinePath", () => {
  test("runs from the left edge to the right edge", () => {
    const pts = points(sparklinePath([1, 3], 200, 50));
    expect(pts[0][0]).toBe(0);
    expect(pts[pts.length - 1][0]).toBe(200);
  });

  test("a higher value sits higher on the chart (smaller y)", () => {
    const [low, high] = points(sparklinePath([1, 9], 100, 40));
    expect(high[1]).toBeLessThan(low[1]);
  });

  test("a flat series is a centred line with no NaN", () => {
    const d = sparklinePath([5, 5, 5], 100, 40);
    expect(d).not.toContain("NaN");
    expect(points(d).every(([, y]) => y === 20)).toBe(true);
  });

  test("fewer than two values draw nothing", () => {
    expect(sparklinePath([], 100, 40)).toBe("");
    expect(sparklinePath([3], 100, 40)).toBe("");
  });
});
