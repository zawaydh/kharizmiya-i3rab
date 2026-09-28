// @vitest-environment jsdom
import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import TopicIntroGate from "../app/components/TopicIntroGate";

afterEach(cleanup);

describe("TopicIntroGate", () => {
  it("shows a short topic orientation before mounting the learning view", () => {
    render(
      <TopicIntroGate topicName="الفاعل">
        <div>المحرّك التعليمي الحالي</div>
      </TopicIntroGate>,
    );

    expect(screen.getByRole("heading", { name: "مهمتك في الفاعل" })).toBeTruthy();
    expect(screen.getByText("أجب عن المطلوب في الخطوة الحالية فقط")).toBeTruthy();
    expect(screen.queryByText("المحرّك التعليمي الحالي")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "ابدأ التعلّم" }));

    expect(screen.queryByRole("heading", { name: "مهمتك في الفاعل" })).toBeNull();
    expect(screen.getByText("المحرّك التعليمي الحالي")).toBeTruthy();
  });
});
