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


  it("shows the hint in the same work area and keeps the wrong choice red after returning", () => {
    const choices = read("app/components/exercise/ExerciseChoiceAnswers.tsx");
    const questionStage = read("app/components/exercise/ExerciseQuestionStage.tsx");
    const player = read("app/components/ExercisePlayer.tsx");
    const cleanCss = readCleanSystemCss();
    expect(choices).toContain('feedback?.wrongId === answer.id ? "is-wrong"');
    expect(choices).not.toContain("correctId");
    expect(choices).not.toContain("style={answerBtn}");
    expect(cleanCss).toContain(".exercise-answer-btn.is-wrong");
    expect(cleanCss).toContain("background: var(--clean-danger-soft);");
    expect(cleanCss).toContain("border-color: var(--clean-danger);");
    expect(questionStage).toContain('dialogBubble?.tone === "hint" ? (');
    expect(questionStage).toContain('className="inline-correction-hint"');
    expect(questionStage).not.toContain("hint-below-options");
    expect(questionStage).toContain("<ExerciseChoiceAnswers");
    expect(player).toContain("setDialogBubble(null);");
    expect(player).not.toMatch(/onDismissHint=\{\(\) => \{[^}]*setFeedback\(null\)/s);
  });

  it("removes the redundant rule-review control from the question flow", () => {
    const questionStage = read("app/components/exercise/ExerciseQuestionStage.tsx");
    const feedbackCss = read("app/styles/61-exercise-feedback.css");
    expect(questionStage).not.toContain("ExerciseRuleHelp");
    expect(questionStage).not.toContain("راجع الشرح");
    expect(feedbackCss).not.toContain("exercise-rule-review");
  });

  it("uses one restrained typography scale across exercises and games", () => {
    const cleanCss = readCleanSystemCss();
    const feedbackCss = read("app/styles/61-exercise-feedback.css");
    const gamesCss = read("app/styles/74-speech-game.css");
    const textGameCss = read("app/styles/72-text-game.css");
    expect(cleanCss).toContain("--clean-text-question:");
    expect(cleanCss).toContain("--clean-text-option: clamp(16px, 1.35vw, 18px);");
    expect(cleanCss).toContain("--clean-game-target: clamp(30px, 3.6vw, 36px);");
    expect(feedbackCss).toContain("font-size: var(--clean-text-question);");
    expect(feedbackCss).toContain("font-size: var(--clean-text-option);");
    expect(feedbackCss).not.toContain("font-size: 11.5px;");
    expect(gamesCss).toContain(".place-game-word-card>strong{color:var(--clean-gold-text);font-size:clamp(28px,3.2vw,32px)");
    expect(gamesCss).not.toContain(".place-game-word-card strong{color:var(--clean-gold-text)");
    expect(gamesCss).toContain(".markati-speaking-line strong");
    expect(textGameCss).toContain("font-size: clamp(20px, 2.2vw, 23px);");
    expect(textGameCss).toContain("font-size: var(--clean-sentence);");
    expect(textGameCss).toContain("font-size: var(--clean-text-option);");
    expect(textGameCss).not.toContain("font-size: clamp(24px,3.8vw,34px);");
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
