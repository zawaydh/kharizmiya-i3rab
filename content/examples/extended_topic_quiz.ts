import type { ExerciseExample } from "../../lib/exercise/model";

function firstLine(value: unknown) {
  return String(value || "").split("\n").map((line) => line.trim()).find(Boolean) || "";
}

export function buildTopicQuizExamples(
  examples: ExerciseExample[],
  prompt: string,
  whyCorrect: string,
): ExerciseExample[] {
  const answers = Array.from(
    new Set(examples.map((example) => firstLine(example.facts?.finalI3rab)).filter(Boolean)),
  );

  return examples.map((example, index) => {
    const correct = firstLine(example.facts?.finalI3rab);
    const rotated = answers.length
      ? [...answers.slice(index % answers.length), ...answers.slice(0, index % answers.length)]
      : [];
    const options = Array.from(new Set([correct, ...rotated.filter((value) => value !== correct)])).slice(0, 4);
    return {
      ...example,
      prompt,
      options,
      correctI3rab: correct,
      whyCorrect,
      optionReasons: Object.fromEntries(
        options.map((option) => [
          option,
          option === correct
            ? whyCorrect
            : "راجع الوظيفة النحوية أولًا، ثم الحكم، ثم صورة الكلمة والعلامة أو المحل.",
        ]),
      ),
    };
  });
}
