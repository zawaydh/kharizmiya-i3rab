/** @vitest-environment jsdom */

import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import { ExerciseChoiceAnswers } from "../app/components/exercise/ExerciseChoiceAnswers";
import { ExercisePracticeQuestion } from "../app/components/exercise/ExercisePracticeQuestion";
import {
  ExerciseHeroView,
  GlobalExerciseProgress,
  SmartGlossaryPopover,
  StageBottomNavigation,
  StageCompletionBanner,
} from "../app/components/exercise/ExerciseSharedViews";

afterEach(cleanup);

describe("exercise views in a real DOM", () => {
  it("invokes the stage reset action and exposes its accessible name", async () => {
    const onReset = vi.fn();
    render(<StageCompletionBanner mode="learn" onReset={onReset} />);

    await userEvent.click(screen.getByRole("button"));
    expect(onReset).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("button").textContent).not.toBe("");
  });

  it("keeps locked navigation disabled and closes glossary dialogs", async () => {
    const onNext = vi.fn();
    const onClose = vi.fn();
    render(
      <>
        <StageBottomNavigation visible ready={false} label="المرحلة التالية" onClick={onNext} />
        <SmartGlossaryPopover term="الأفعال الخمسة" onClose={onClose} />
      </>,
    );

    const next = screen.getByRole("button", { name: "المرحلة التالية" }) as HTMLButtonElement;
    expect(next.disabled).toBe(true);
    await userEvent.click(screen.getByRole("button", { name: "×" }));
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("dialog").getAttribute("aria-label")).toBe("الأفعال الخمسة");
  });


  it("never nests glossary buttons inside answer buttons", () => {
    const tree = {
      startNodeId: "present-start",
      nodes: {},
    };
    const { container, rerender } = render(
      <ExerciseChoiceAnswers
        answers={[{ id: "five", text: "الأفعال الخمسة", next: "result" }]}
        cardPhase="idle"
        mode="learn"
        tree={tree}
        feedback={null}
        onGlossary={() => undefined}
        onPickAnswer={() => undefined}
      />,
    );

    expect(container.querySelector("button button")).toBeNull();

    rerender(
      <ExercisePracticeQuestion
        target="يكتبون"
        cardPhase="idle"
        wrongPanel={null}
        retryReady={false}
        directOptions={["الأفعال الخمسة"]}
        successNudge={null}
        onGlossary={() => undefined}
        onRetry={() => undefined}
        onContinue={() => undefined}
        onPickOption={() => undefined}
      />,
    );

    expect(container.querySelector("button button")).toBeNull();
  });

  it("passes automated Axe checks for the progress and completion surface", async () => {
    const { container } = render(
      <main>
        <ExerciseHeroView
          stageTitle="التعلّم الموجّه"
          mode="learn"
          doneCount={2}
          totalCount={5}
          nextStepLabel="تمييز نوع الكلمة"
          coveredPercent={40}
          quizCursor={0}
          quizTotal={0}
          quizCount={10}
          quizFinished={false}
        />
        <GlobalExerciseProgress
          mode="learn"
          coveredDone={2}
          coverageTotal={5}
          quizCursor={0}
          quizTotal={0}
          quizCount={10}
          quizFinished={false}
        />
        <StageCompletionBanner mode="practice" onReset={() => undefined} />
      </main>,
    );

    const result = await axe.run(container);
    expect(result.violations).toEqual([]);
  });
});
