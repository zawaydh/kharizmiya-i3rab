import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { readCleanSystemCss } from "./cssTestUtils";

const read = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

describe("first local-review correction batch", () => {
  it("removes the grid background from the platform body", () => {
    const css = readCleanSystemCss();
    const bodyRule = css.match(/body\.platform-body \{[\s\S]*?\n\}/)?.[0] || "";
    expect(bodyRule).not.toContain("32px 32px");
    expect(bodyRule).not.toContain("linear-gradient(90deg");
  });

  it("keeps hint panels naturally sized without an inner scrollbar", () => {
    const css = readCleanSystemCss();
    expect(css).toContain("max-height: none;");
    expect(css).toContain("overflow: visible;");
  });

  it("keeps one lateral question-card motion while respecting reduced motion", () => {
    const css = readCleanSystemCss();
    const player = read("app/components/ExercisePlayer.tsx");
    expect(css).toContain("khSingleQuestionEnter");
    expect(css).toContain("khSingleQuestionLeave");
    expect(css).toContain("question-text-leaving");
    expect(css).toContain("prefers-reduced-motion: reduce");
    expect(css).toContain("translate3d(-44px, 0, 0)");
    expect(css).toContain("translate3d(44px, 0, 0)");
    expect(css).not.toContain("khQuestionStageEnter");
    expect(css).not.toContain("khQuestionStageEnterContinuous");
    expect(css).not.toContain("question-transition-ghost");
    expect(css).not.toContain("practice-direct-option:nth-child(3)");
    expect(player).toContain("const STAGED_QUESTION_EXIT_MS = 180");
    expect(player).toContain("const STAGED_QUESTION_ENTER_MS = 320");
  });

  it("removes the repeated click badge and uses a robust reset handler", () => {
    const player = read("app/components/ExercisePlayer.tsx");
    const navigation = read("app/components/exercise/ExerciseNavigationActions.ts");
    const questionStage = read("app/components/exercise/ExerciseQuestionStage.tsx");
    expect(player).not.toContain("answerDragLabel(mode)");
    expect(navigation).toContain("function resetCurrentExample()");
    expect(player).toContain("onReset={navigation.resetCurrentExample}");
    expect(questionStage).toContain("onClick={onReset}");
  });

  it("renders the certificate without the application navigation or footer", () => {
    const nav = read("app/components/Navbar.tsx");
    const footer = read("app/components/RouteAwareFooter.tsx");
    expect(nav).toContain('pathname === "/certificate"');
    expect(nav).toContain("if (certificateRoute) return null");
    expect(footer).toContain('"/certificate"');
  });
});
