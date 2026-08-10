import { describe, expect, it } from "vitest";
import { parseProgressSubmission } from "../lib/progressEvents";

describe("progress evidence validation", () => {
  it("accepts trimmed stage and quiz evidence", () => {
    expect(parseProgressSubmission({
      kind: "stage-result",
      topicId: " present-verb ",
      level: 2,
      mode: "practice",
      exampleId: " example-1 ",
      resultNodeId: " result-1 ",
    })).toMatchObject({ topicId: "present-verb", mode: "practice" });

    expect(parseProgressSubmission({
      kind: "quiz-complete",
      topicId: "present-verb",
      level: 2,
      answers: [{ exampleId: "one", actualLabel: "فعل مضارع مرفوع" }],
    })).toMatchObject({ kind: "quiz-complete" });
  });

  it("rejects invalid shapes, levels, modes, lengths, and answer rows", () => {
    const base = { topicId: "present-verb", level: 2 };
    expect(parseProgressSubmission(null)).toBeNull();
    expect(parseProgressSubmission([])).toBeNull();
    expect(parseProgressSubmission({ ...base, level: 0, kind: "stage-result" })).toBeNull();
    expect(parseProgressSubmission({ ...base, level: 2.5, kind: "stage-result" })).toBeNull();
    expect(parseProgressSubmission({ ...base, kind: "stage-result", mode: "quiz", exampleId: "x", resultNodeId: "r" })).toBeNull();
    expect(parseProgressSubmission({ ...base, kind: "stage-result", mode: "learn", exampleId: "", resultNodeId: "r" })).toBeNull();
    expect(parseProgressSubmission({ ...base, kind: "quiz-complete", answers: [] })).toBeNull();
    expect(parseProgressSubmission({ ...base, kind: "quiz-complete", answers: new Array(51).fill({}) })).toBeNull();
    expect(parseProgressSubmission({ ...base, kind: "quiz-complete", answers: [null] })).toBeNull();
    expect(parseProgressSubmission({ ...base, kind: "quiz-complete", answers: [{ exampleId: "x", actualLabel: 2 }] })).toBeNull();
    expect(parseProgressSubmission({ ...base, kind: "unknown" })).toBeNull();
  });
});
