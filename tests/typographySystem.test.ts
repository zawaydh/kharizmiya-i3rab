import fs from "node:fs";
import path from "node:path";
import { describe, expect, test } from "vitest";

function read(relativePath: string): string {
  return fs.readFileSync(path.join(process.cwd(), relativePath), "utf8");
}

describe("TYPOGRAPHY_SYSTEM_CONTRACT", () => {
  test("النص الأساسي لا يُدفع إلى طبقة GPU ولا يعتمد تنعيمًا قسريًا", () => {
    const clean = read("app/styles/80-clean-system.css");

    expect(clean).toContain("font-synthesis: none;");
    expect(clean).toContain("text-rendering: auto;");
    expect(clean).toContain("-webkit-font-smoothing: auto;");
    expect(clean).not.toContain("transform: translate3d(0, 0, 0);");
    expect(clean).not.toContain("will-change: transform, opacity;");
  });

  test("الألعاب تستخدم السلم الطباعي المركزي دون أوزان تركيبية ثقيلة", () => {
    const textGame = read("app/styles/72-text-game.css");
    const speechGame = read("app/styles/74-speech-game.css");

    expect(textGame).not.toMatch(/font-weight:\s*(?:850|900|950)\b/u);
    expect(speechGame).not.toMatch(/font-weight:\s*(?:650|750|850)\b/u);

    expect(textGame).not.toMatch(/font-size:\s*(?:12|13)px\b/u);
    expect(speechGame).not.toMatch(/font-size:\s*(?:12|13)px\b/u);

    expect(textGame).toContain("var(--clean-game-title)");
    expect(speechGame).toContain("var(--clean-game-title)");
  });
});
