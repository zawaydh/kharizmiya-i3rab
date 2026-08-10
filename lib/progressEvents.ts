export type StageResultProgressSubmission = {
  kind: "stage-result";
  topicId: string;
  level: number;
  mode: "learn" | "practice";
  exampleId: string;
  resultNodeId: string;
};

export type QuizAnswerEvidence = {
  exampleId: string;
  actualLabel: string;
};

export type QuizProgressSubmission = {
  kind: "quiz-complete";
  topicId: string;
  level: number;
  answers: QuizAnswerEvidence[];
};

export type ProgressSubmission =
  | StageResultProgressSubmission
  | QuizProgressSubmission;

type QuizRowLike = {
  exampleId: string;
  actualLabel: string | null;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function safeText(value: unknown, maxLength: number): string | null {
  if (typeof value !== "string") return null;
  const text = value.trim();
  if (!text || text.length > maxLength) return null;
  return text;
}

function safeLevel(value: unknown): number | null {
  return Number.isInteger(value) && Number(value) > 0 && Number(value) <= 10
    ? Number(value)
    : null;
}

export function parseProgressSubmission(value: unknown): ProgressSubmission | null {
  if (!isRecord(value)) return null;
  const topicId = safeText(value.topicId, 120);
  const level = safeLevel(value.level);
  if (!topicId || level === null) return null;

  if (value.kind === "stage-result") {
    const mode = value.mode === "learn" || value.mode === "practice" ? value.mode : null;
    const exampleId = safeText(value.exampleId, 160);
    const resultNodeId = safeText(value.resultNodeId, 200);
    if (!mode || !exampleId || !resultNodeId) return null;
    return { kind: value.kind, topicId, level, mode, exampleId, resultNodeId };
  }

  if (value.kind === "quiz-complete") {
    if (!Array.isArray(value.answers) || value.answers.length === 0 || value.answers.length > 50) {
      return null;
    }
    const answers: QuizAnswerEvidence[] = [];
    for (const item of value.answers) {
      if (!isRecord(item)) return null;
      const exampleId = safeText(item.exampleId, 160);
      const actualLabel = safeText(item.actualLabel, 2000);
      if (!exampleId || !actualLabel) return null;
      answers.push({ exampleId, actualLabel });
    }
    return { kind: value.kind, topicId, level, answers };
  }

  return null;
}

export function buildStageResultSubmission(params: {
  topicId: string;
  level: number;
  mode: "learn" | "practice";
  exampleId: string | number;
  resultNodeId: string;
}): StageResultProgressSubmission {
  return {
    kind: "stage-result",
    topicId: params.topicId,
    level: params.level,
    mode: params.mode,
    exampleId: String(params.exampleId),
    resultNodeId: params.resultNodeId,
  };
}

export function buildQuizProgressSubmission(params: {
  topicId: string;
  level: number;
  rows: readonly QuizRowLike[];
}): QuizProgressSubmission {
  return {
    kind: "quiz-complete",
    topicId: params.topicId,
    level: params.level,
    answers: params.rows.map((row) => ({
      exampleId: String(row.exampleId),
      actualLabel: String(row.actualLabel || ""),
    })),
  };
}
