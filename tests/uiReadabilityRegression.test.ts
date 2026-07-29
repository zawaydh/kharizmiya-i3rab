import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(process.cwd());

function read(relativePath: string) {
  return readFileSync(resolve(root, relativePath), "utf8");
}

describe("UI readability regressions", () => {
  it("keeps the next-example action immediate, explicit, and fully opaque", () => {
    const player = read("app/components/ExercisePlayer.tsx");
    const css = read("app/styles/80-clean-system.css");
    expect(player).toContain("setFinalCtaReady(true)");
    expect(player).toContain("انتقل إلى المثال التالي");
    expect(player).not.toContain("opacity: canMoveAfterResult ? 1 : 0.55");
    expect(player).not.toContain("أحسنت! هذه ثمرة المسار");
    expect(player).not.toContain("توقّف لحظة واقرأ الإعراب النهائي");
    expect(css).toContain("RESULT ACTION — always legible");
    expect(css).toContain("visibility: visible !important");
  });

  it("does not render glossary terms as blue information icons", () => {
    const start = read("app/components/InteractiveLearning.jsx");
    const textViews = read("app/components/exercise/ExerciseTextViews.tsx");
    const css = read("app/styles/80-clean-system.css");
    expect(start).not.toContain("term-info-btn");
    expect(textViews).toContain('className="smart-term"');
    expect(css).toContain(".smart-term::after");
    expect(css).toContain("content: none !important");
    expect(css).toContain("color: inherit !important");
  });

  it("uses concise questions and removes generic repeated leads", () => {
    const start = read("app/components/InteractiveLearning.jsx");
    expect(start).toContain("ما نوع كلمة «${target}»؟");
    expect(start).not.toContain("في جملة «${example.sentence}» نركّز على");
    expect(start).not.toContain("الكلمة المطلوبة");
    expect(start).not.toContain("انقر على الإجابة الصحيحة: ${answer}");
    expect(start).toContain("تحديد نوع الكلمة");
    expect(start).toContain("الآن نكمل|بقي أن|نكمل بناء");
    const examples = read("data/interactive_examples.json");
    expect(examples).not.toContain("الآن نكمل بناء الإعراب");
    expect(examples).not.toContain("أول خطوة: نميّز الكلمة");
  });

  it("keeps speech-game text on solid readable surfaces", () => {
    const css = read("app/styles/70-pages-games-dashboard.css");
    expect(css).toContain("color: var(--clean-text) !important");
    expect(css).toContain("background: var(--clean-success-soft) !important");
    expect(css).toContain("background: var(--clean-gold-soft) !important");
    expect(css).not.toContain("color:#fff3b0");
  });

  it("has one authoritative start-page layer", () => {
    const cssFiles = [
      "30-start-learning-core.css",
      "40-learning-flow.css",
      "50-exercise-workspace.css",
      "60-exercise-stability.css",
      "70-pages-games-dashboard.css",
    ];
    for (const file of cssFiles) {
      expect(read(`app/styles/${file}`)).not.toContain(".start-learning-refined");
    }
    const finalCss = read("app/styles/80-clean-system.css");
    expect(finalCss).toContain("START PAGE — authoritative readable layout");
  });
});
