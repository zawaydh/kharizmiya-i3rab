import { describe, expect, test } from "vitest";
import { mergeProgressRecord } from "../lib/progressMerge";
import {
  getQuizPercent,
  isCertificateEligible,
} from "../lib/certificateEligibility";
import { resolveVisualPathTopic } from "../lib/topics";

const existingProgress = {
  user_id: "student-1",
  topic_code: "nominal-advanced",
  level: 2,
  percent: 100,
  coverage: ["learn.a"],
  practice_percent: 75,
  practice_coverage: ["practice.a"],
  learn_completed: true,
  practice_completed: false,
  quiz_passed: true,
  quiz_score: 13,
  quiz_total: 15,
  updated_at: "2026-07-20T00:00:00.000Z",
};

describe("دمج تقدم الطالب", () => {
  test("حفظ التعلّم لا يمحو التدريب أو الاختبار", () => {
    const result = mergeProgressRecord({
      existing: existingProgress,
      update: {
        percent: 100,
        coverage: ["learn.b"],
        learn_completed: true,
      },
      userId: "student-1",
      topicCode: "nominal-advanced",
      level: 2,
      updatedAt: "2026-07-21T00:00:00.000Z",
    });

    expect(result.coverage).toEqual(["learn.a", "learn.b"]);
    expect(result.practice_percent).toBe(75);
    expect(result.practice_coverage).toEqual(["practice.a"]);
    expect(result.quiz_passed).toBe(true);
    expect(result.quiz_score).toBe(13);
    expect(result.quiz_total).toBe(15);
  });

  test("حفظ التدريب لا يمحو التعلّم أو الاختبار", () => {
    const result = mergeProgressRecord({
      existing: existingProgress,
      update: {
        practice_percent: 100,
        practice_coverage: ["practice.b"],
        practice_completed: true,
      },
      userId: "student-1",
      topicCode: "nominal-advanced",
      level: 2,
    });

    expect(result.percent).toBe(100);
    expect(result.coverage).toEqual(["learn.a"]);
    expect(result.practice_coverage).toEqual(["practice.a", "practice.b"]);
    expect(result.quiz_score).toBe(13);
    expect(result.quiz_total).toBe(15);
  });

  test("حفظ الاختبار لا يمحو التعلّم أو التدريب", () => {
    const result = mergeProgressRecord({
      existing: existingProgress,
      update: { quiz_passed: false, quiz_score: 10, quiz_total: 15 },
      userId: "student-1",
      topicCode: "nominal-advanced",
      level: 2,
    });

    expect(result.percent).toBe(100);
    expect(result.practice_percent).toBe(75);
    expect(result.coverage).toEqual(["learn.a"]);
    expect(result.practice_coverage).toEqual(["practice.a"]);
    expect(result.quiz_passed).toBe(false);
    expect(result.quiz_score).toBe(10);
  });
});

describe("روابط المسارات البصرية", () => {
  test("الموضوع ذو المسار البصري يظل موضوعه نفسه", () => {
    const result = resolveVisualPathTopic("present-verb");
    expect(result.status).toBe("available");
    expect(result.code).toBe("present-verb");
    expect(result.topic?.code).toBe("present-verb");
  });

  test("الموضوع الموجود بلا مسار بصري لا يتحول إلى المبتدأ", () => {
    const result = resolveVisualPathTopic("attached-pronouns");
    expect(result.status).toBe("unavailable");
    expect(result.code).toBe("attached-pronouns");
    expect(result.topic?.code).toBe("attached-pronouns");
  });

  test("الرمز غير الموجود يعاد كموضوع غير موجود", () => {
    const result = resolveVisualPathTopic("missing-topic");
    expect(result.status).toBe("not-found");
    expect(result.topic).toBeNull();
  });

  test("فتح صفحة المسارات دون موضوع يستخدم الجملة الاسمية افتراضيًا", () => {
    const result = resolveVisualPathTopic(null);
    expect(result.status).toBe("available");
    expect(result.code).toBe("nominal-advanced");
    expect(result.isDefault).toBe(true);
  });
});

describe("شروط الشهادة", () => {
  test("لا تفتح الشهادة قبل استيفاء الشروط الثلاثة", () => {
    const valid = {
      learn_completed: true,
      practice_completed: true,
      quiz_passed: true,
      quiz_score: 12,
      quiz_total: 15,
    };

    expect(isCertificateEligible(valid)).toBe(true);
    expect(isCertificateEligible({ ...valid, learn_completed: false, percent: 80 })).toBe(false);
    expect(
      isCertificateEligible({
        ...valid,
        practice_completed: false,
        practice_percent: 90,
      })
    ).toBe(false);
    expect(
      isCertificateEligible({
        ...valid,
        quiz_passed: false,
        quiz_score: 11,
        quiz_total: 15,
      })
    ).toBe(false);
  });

  test("تقبل السجلات القديمة المكتملة بالنسب ولا تفتح عند أقل من 80%", () => {
    expect(
      isCertificateEligible({
        percent: 100,
        practice_percent: 100,
        quiz_score: 12,
        quiz_total: 15,
      })
    ).toBe(true);
    expect(
      isCertificateEligible({
        percent: 100,
        practice_percent: 100,
        quiz_score: 11,
        quiz_total: 15,
      })
    ).toBe(false);
    expect(getQuizPercent({ quiz_score: 12, quiz_total: 15 })).toBe(80);
  });
});
