import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const read = (file: string) => readFileSync(resolve(process.cwd(), file), "utf8");

describe("هوية الألعاب وحركة النجاح", () => {
  it("يعطي كل لعبة هوية بصرية مستقلة عن مدرب التفكير وعن بقية الألعاب", () => {
    expect(read("app/components/WhereIsMyPlaceGame.tsx")).toContain("game-theme-place");
    expect(read("app/components/WhoIsWithMeGame.tsx")).toContain("game-theme-team");
    expect(read("app/components/WhichMafoolGame.tsx")).toContain("game-theme-mafool");
    expect(read("app/components/MarkatiGame.tsx")).toContain("game-theme-mark");
    expect(read("app/components/I3rabInOurSpeechGame.tsx")).toContain("game-theme-speech");
    const themeModule = read("app/components/games/GameVisualTheme.tsx");
    for (const theme of ["place", "team", "mafool", "mark", "speech"]) {
      expect(themeModule).toContain(`${theme}: {`);
    }
    expect(themeModule).toContain("background: theme.surface");
  });

  it("يجعل علامة الصح تقفز ثم تختفي ببطء مع احترام تقليل الحركة", () => {
    const themeModule = read("app/components/games/GameVisualTheme.tsx");
    expect(themeModule).toContain("element.animate");
    expect(themeModule).toContain("duration: 1280");
    expect(themeModule).toContain('window.matchMedia("(prefers-reduced-motion: reduce)")');
    expect(themeModule).toContain('opacity: 0, transform: "translateY(-18px) scale(.92)"');
  });
});
