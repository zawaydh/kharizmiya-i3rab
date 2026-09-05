import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { readCleanSystemCss } from "./cssTestUtils";

const root = process.cwd();
const cleanCss = readCleanSystemCss();
const speechGameCss = fs.readFileSync(path.join(root, "app/styles/74-speech-game.css"), "utf8");
const player = fs.readFileSync(path.join(root, "app/components/ExercisePlayer.tsx"), "utf8");
const questionStage = fs.readFileSync(
  path.join(root, "app/components/exercise/ExerciseQuestionStage.tsx"),
  "utf8"
);
const questionMotion = fs.readFileSync(
  path.join(root, "app/components/exercise/useQuestionMotion.ts"),
  "utf8"
);
const exerciseStabilityCss = fs.readFileSync(
  path.join(root, "app/styles/60-exercise-stability.css"),
  "utf8"
);
const learningStabilityCss = fs.readFileSync(
  path.join(root, "app/styles/82-learning-stability.css"),
  "utf8"
);

describe("single-card question motion and narrow result layout", () => {
  it("moves one complete question card laterally without staggered children", () => {
    expect(cleanCss).toContain("khSingleQuestionEnter");
    expect(cleanCss).toContain("khSingleQuestionLeave");
    expect(cleanCss).toContain("question-content-motion.question-text-entering");
    expect(cleanCss).not.toContain("animation: khQuestionPartEnter");
  });

  it("does not mount an outgoing HTML ghost over the incoming question", () => {
    expect(player).toContain("beginUnifiedQuestionTransition");
    expect(questionMotion).toContain('setCardPhase("leaving")');
    expect(questionMotion).toContain('setCardPhase("entering")');
    expect(player).not.toContain("questionTransitionGhost");
    expect(player).not.toContain("dangerouslySetInnerHTML");
  });

  it("keeps the workspace stable without fixing a clipping height", () => {
    expect(questionStage).toContain("minHeight: `${questionMotionHeight}px`");
    expect(questionStage).not.toContain("height: `${questionMotionHeight}px`");
  });

  it("forces the final result into one responsive column", () => {
    expect(cleanCss).toContain("grid-template-columns: minmax(0, 1fr);");
    expect(cleanCss).toContain("writing-mode: horizontal-tb;");
    expect(cleanCss).not.toContain("grid-template-columns: minmax(0, 1fr) !important");
    expect(cleanCss).not.toContain("writing-mode: horizontal-tb !important");
  });

  it("keeps settled exercise text off permanent GPU scaling", () => {
    expect(exerciseStabilityCss).not.toContain(
      "transform: translateZ(0) scale(1.01);",
    );
    expect(exerciseStabilityCss).toContain(
      "EXERCISE_TEXT_CLARITY_STATIC_RENDER_V1",
    );

    const settledMotion = learningStabilityCss.match(
      /question-text-idle,[\s\S]*?question-text-success\s*\{[\s\S]*?\}/u,
    )?.[0] || "";

    expect(settledMotion).toContain("transform: none;");
    expect(settledMotion).toContain("will-change: auto;");
    expect(settledMotion).toContain("backface-visibility: visible;");

    // Motion itself is retained only for actual entering/leaving states.
    expect(learningStabilityCss).toContain(
      "animation: khSingleQuestionLeave 180ms",
    );
    expect(learningStabilityCss).toContain(
      "animation: khSingleQuestionEnter 320ms",
    );
  });
  it("uses the broadly supported flex-end value", () => {
    expect(speechGameCss).toContain("align-items: flex-end;");
    expect(speechGameCss).not.toContain("align-items: end;");
  });
});
