import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { readCleanSystemCss } from "./cssTestUtils";

const root = resolve(process.cwd());

function read(relativePath: string) {
  return readFileSync(resolve(root, relativePath), "utf8");
}

describe("UI readability regressions", () => {
  it("keeps the next-example action immediate, explicit, and fully opaque", () => {
    const player = read("app/components/ExercisePlayer.tsx");
    const resultStage = read("app/components/exercise/ExerciseResultStage.tsx");
    const css = readCleanSystemCss();
    expect(player).toContain("const canMoveAfterResult = !currentFollowUp");
    expect(player).not.toContain("finalCtaReady");
    expect(resultStage).toContain("انتقل إلى المثال التالي");
    expect(player).not.toContain("opacity: canMoveAfterResult ? 1 : 0.55");
    expect(player).not.toContain("أحسنت! هذه ثمرة المسار");
    expect(player).not.toContain("توقّف لحظة واقرأ الإعراب النهائي");
    expect(css).toContain("RESULT ACTION — always legible");
    expect(css).toContain("visibility: visible;");
  });

  it("does not render glossary terms as blue information icons", () => {
    const start = read("app/components/InteractiveLearning.tsx");
    const textViews = read("app/components/exercise/ExerciseTextViews.tsx");
    const css = readCleanSystemCss();
    expect(start).not.toContain("term-info-btn");
    expect(textViews).toContain('className="smart-term"');
    expect(css).toContain(".smart-term::after");
    expect(css).toMatch(/\.smart-term::after,\s*\.start-smart-term::after\s*\{\s*content:\s*none;/);
    expect(css).toContain("color: inherit;");
    expect(css).not.toContain("content: none !important");
  });

  it("uses concise questions and removes generic repeated leads", () => {
    const start = read("app/components/InteractiveLearning.tsx");
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
    const css = read("app/styles/74-speech-game.css");
    expect(css).toContain("color: var(--clean-text);");
    expect(css).toContain("background: var(--clean-success-soft);");
    expect(css).toContain("background: var(--clean-gold-soft);");
    expect(css).not.toContain("color:#fff3b0");
  });

  it("has one authoritative start-page layer", () => {
    const cssFiles = [
      "30-start-learning-core.css",
      "31-start-page-flow.css",
      "40-learning-flow.css",
      "50-exercise-workspace.css",
      "60-exercise-stability.css",
      "61-exercise-feedback.css",
      "70-exercise-flow.css",
      "71-quiz-remedial.css",
      "72-text-game.css",
      "73-paths-dashboard.css",
      "74-speech-game.css",
    ];
    for (const file of cssFiles) {
      expect(read(`app/styles/${file}`)).not.toContain(".start-learning-refined");
    }
    const finalCss = readCleanSystemCss();
    expect(finalCss).toContain("START PAGE — authoritative readable layout");
  });
  it("keeps first-step feedback aligned with the actual word type", () => {
    const start = read("app/components/InteractiveLearning.tsx");
    expect(start).toContain('const correctType = String(step?.answer || "")');
    expect(start).toContain("اسم إشارة يدل على معيّن");
    expect(start).toContain("اسم له معنى مستقل");
    expect(start).not.toContain("لها معنى يدل على حدث وزمن");
  });

  it("keeps start-completion actions and topic titles visible on white cards", () => {
    const css = readCleanSystemCss();
    expect(css).toContain(".start-learning-refined .start-finish-card .result-actions .btn.secondary");
    expect(css).toContain(".start-learning-refined .start-topic-card strong");
    expect(css).toContain("background: var(--clean-primary-soft);");
    expect(css).toContain("visibility: visible;");
    expect(css).toContain(".topics-branch-page .topic-branch-card h2");
    expect(css).toContain(".topics-branch-page .topic-branch-learn");
  });

});
