import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const read = (file: string) => readFileSync(resolve(process.cwd(), file), "utf8");

describe("ترابط أسئلة وتلميحات الموضوعات الجديدة", () => {
  it("يلغي المقدمة العامة ويبني السؤال على النتيجة السابقة", () => {
    const opening = read("app/components/exercise/ExerciseOpeningDialogue.ts");
    const extended = read("app/components/exercise/ExtendedTopicOpeningDialogue.ts");
    expect(opening).not.toContain("لكي نعرب ${kind} نركز");
    expect(opening).toContain("extendedTopicOpeningDialogueLine");
    for (const phrase of [
      "ثبت أن (${target}) تبين هيئة صاحبها وقت الفعل",
      "ثبت أن (${target}) تزيل إبهامًا",
      "ثبت أن (${target}) منادى",
      "ثبت وجود أداة الاستثناء قبل (${target})",
      "ثبت أن «لا» نافية للجنس عاملة",
      "ثبت أن (${verb}) مبني للمجهول",
      "ثبت أن (${target}) اسم منقوص",
    ]) expect(extended).toContain(phrase);
  });

  it("يربط التلميح الخاطئ بالاختيار نفسه وبالخطوة التالية", () => {
    const hints = read("app/components/exercise/ExtendedTopicStudentHints.ts");
    expect(hints).toContain("pickedDiagnostic");
    expect(hints).toContain("اختيار «${chosen}» لا يطابق هذه الخطوة في الجملة");
    expect(hints).toContain("nextStepCue");
  });
});
