import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function channel(value: number) {
  const normalized = value / 255;
  return normalized <= 0.04045
    ? normalized / 12.92
    : Math.pow((normalized + 0.055) / 1.055, 2.4);
}

function luminance(hex: string) {
  const clean = hex.replace("#", "");
  const [r, g, b] = [0, 2, 4].map((offset) =>
    Number.parseInt(clean.slice(offset, offset + 2), 16),
  );
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function contrast(foreground: string, background: string) {
  const first = luminance(foreground);
  const second = luminance(background);
  const lighter = Math.max(first, second);
  const darker = Math.min(first, second);
  return (lighter + 0.05) / (darker + 0.05);
}

describe("final color system", () => {
  it.each([
    ["#172033", "#ffffff"],
    ["#5f6d81", "#ffffff"],
    ["#5f6d81", "#eef6fb"],
    ["#0f766e", "#ffffff"],
    ["#0f766e", "#edf9f8"],
    ["#ffffff", "#137f7a"],
    ["#172033", "#e0b84c"],
    ["#145a31", "#edf9f1"],
    ["#852433", "#fff1f3"],
    ["#734b00", "#fff8df"],
    ["#dce7ed", "#081722"],
  ])("keeps %s readable on %s", (foreground, background) => {
    expect(contrast(foreground, background)).toBeGreaterThanOrEqual(4.5);
  });

  it("does not use the former low-contrast accent colors as text in the final layer", () => {
    const css = readFileSync(
      resolve(process.cwd(), "app/styles/80-clean-system.css"),
      "utf8",
    ).toLowerCase();
    expect(css).not.toContain("color: #2cc7bc");
    expect(css).not.toContain("color: #27b9b0");
    expect(css).not.toContain("background: #edc443");
    expect(css).not.toContain("background: #e2b936");
  });
});
