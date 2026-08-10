import { describe, expect, test } from "vitest";
import {
  requireCoverageResult,
  requirePrimaryCoverage,
} from "../content/examples/exampleCoverage";

describe("سلامة ربط الأمثلة بالتغطية ونتائج الاختبار", () => {
  test("يعيد مفتاح التغطية والنتيجة المرتبطة به", () => {
    const example = { id: "example-1", covers: ["skill.one"] };
    expect(requirePrimaryCoverage(example)).toBe("skill.one");
    expect(requireCoverageResult({ "skill.one": "النتيجة الصحيحة" }, example)).toBe(
      "النتيجة الصحيحة",
    );
  });

  test("يرفض المثال الذي لا يحمل مفتاح تغطية", () => {
    expect(() => requirePrimaryCoverage({ id: "missing-cover", covers: [] })).toThrow(
      "مفتاح تغطية واحد على الأقل",
    );
  });

  test("يرفض مفتاح التغطية الذي لا يملك نتيجة اختبار", () => {
    expect(() =>
      requireCoverageResult({}, { id: "missing-result", covers: ["skill.missing"] }),
    ).toThrow("لا توجد نتيجة اختبار");
  });
});
