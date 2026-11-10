const round = (n: number) => Number(n.toFixed(2));

/** An SVG path `d` for a line chart, left edge to right edge. Empty below two points. */
export function sparklinePath(
  values: number[],
  width: number,
  height: number,
): string {
  if (values.length < 2) return "";
  const min = Math.min(...values);
  const span = Math.max(...values) - min;
  return values
    .map((value, i) => {
      const x = (i / (values.length - 1)) * width;
      const y = span === 0 ? height / 2 : height - ((value - min) / span) * height;
      return `${i === 0 ? "M" : "L"}${round(x)},${round(y)}`;
    })
    .join(" ");
}
