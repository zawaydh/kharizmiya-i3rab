import { describe, expect, test } from "vitest";
import { TOPICS } from "../lib/topics";
import { buildRunnerState } from "../lib/exercise/runner";
import {
  buildPracticeCorrectRoute,
  buildPracticeDirectOptions,
  practiceExpectedLabelFromRoute,
  practiceOptionScope,
} from "../app/components/exercise/ExercisePracticeFlow";

function normalized(value: unknown): string {
  return String(value ?? "")
    .normalize("NFKC")
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/gu, "")
    .replace(/[«»]/gu, "")
    .replace(/\s+/gu, " ")
    .trim();
}

function simpleTarget(value: unknown): string {
  const target = String(value ?? "").trim();
  return target && !/\s|[()]/u.test(target) ? target : "";
}

describe("PRACTICE_CORRECTION_AUDIT: تدقيق شامل لتصحيح تدرب", () => {
  test("جميع الأمثلة الجاهزة تنتج تصحيحا كاملا وثابتا ونظيفا", () => {
    for (const topic of TOPICS.filter((item) => item.isReady)) {
      for (const example of topic.examples) {
        const label = `${topic.code} / ${String(example.id || example.target || "")}`;
        const state = buildRunnerState(topic.tree, "practice", example);
        const expected = practiceExpectedLabelFromRoute({
          tree: topic.tree,
          mode: "practice",
          example,
        });

        expect(expected, `${label}: النتيجة النهائية فارغة`).not.toBe("");

        const options = buildPracticeDirectOptions({
          tree: topic.tree,
          mode: "practice",
          example,
          state,
          practiceExpectedLabel: expected,
          topicId: topic.code,
        });

        const wrongOptions = options.filter(
          (option) => normalized(option) !== normalized(expected),
        );

        const routes = (wrongOptions.length ? wrongOptions : ["__audit__"]).map(
          (wrongOption) =>
            buildPracticeCorrectRoute({
              tree: topic.tree,
              mode: "practice",
              example,
              state,
              practiceExpectedLabel: expected,
              topicId: topic.code,
              wrongOption,
            }),
        );

        for (const route of routes) {
          const correction = route.steps.join(" ").trim();
          // FINAL_PRACTICE_REVIEW_FAMILY_AUDIT_V1
          const correctionSemantic = normalized(correction);
          const reviewFacts = (example.facts || {}) as Record<string, unknown>;

          expect(
            correction,
            `${label}: بطاقة المراجعة تحتوي توجيها للطالب بدل خطوة حل مثبتة`,
          ).not.toMatch(
            /(?:^|[.!؟؛]\s*)(?:حدّد|حدد|اختر|طبّق|طبق|ارجع|عد إلى|عد للسؤال|راجع|استخدم|انظر|تأمل|ميّز|ميز|افحص|ابدأ|ثبّت)/u,
          );

          if (
            topic.code === "kana-wa-akhawatuha" &&
            String(reviewFacts.targetRole || "") === "hidden_ism"
          ) {
            expect(correctionSemantic, `${label}: اسم الناسخ المستتر غير ظاهر`)
              .toContain("ضمير مستتر");
            expect(correctionSemantic, `${label}: محل اسم الناسخ المستتر غير مثبت`)
              .toContain("في محل رفع اسم الفعل الناسخ");
            expect(correctionSemantic, `${label}: الفعل الناسخ لم يميز عن اسمه`)
              .toContain("الفعل الناسخ نفسه");
          }

          if (
            topic.code === "fael" &&
            String(reviewFacts.roleKind || "") === "hidden"
          ) {
            expect(correctionSemantic, `${label}: الفاعل المستتر غير ظاهر`)
              .toContain("مستتر");
            expect(correctionSemantic, `${label}: محل الفاعل المستتر غير مثبت`)
              .toContain("في محل رفع فاعل");
          }

          if (
            /(?:مصدر مؤول|شبه جملة|جملة فعلية|جملة اسمية)/u.test(normalized(expected)) &&
            /في محل/u.test(normalized(expected))
          ) {
            expect(
              correctionSemantic,
              `${label}: مراجعة التركيب لم تثبت المحل الإعرابي`,
            ).toMatch(/في محل (?:رفع|نصب|جر|جزم)/u);
          }

          if (topic.code === "past-verb") {
            expect(correctionSemantic, `${label}: مراجعة الماضي لم تثبت نوع الفعل`)
              .toContain("فعل ماض");
            expect(correctionSemantic, `${label}: مراجعة الماضي لم تثبت البناء`)
              .toMatch(/مبني|بناء/u);
          }

          if (topic.code === "present-verb") {
            expect(correctionSemantic, `${label}: مراجعة المضارع لم تثبت نوع الفعل`)
              .toContain("فعل مضارع");
            expect(correctionSemantic, `${label}: مراجعة المضارع لم تفصل الإعراب عن البناء`)
              .toMatch(/معرب|مبني|بني/u);
          }

          if (topic.code === "attached-pronouns") {
            expect(correctionSemantic, `${label}: مراجعة الضمير لم تثبت كونه مبنيا`)
              .toMatch(/ضمير .*مبني/u);
            expect(correctionSemantic, `${label}: مراجعة الضمير لم تثبت محله`)
              .toMatch(/في محل (?:رفع|نصب|جر)/u);
          }

          if (topic.code === "ism-manqous") {
            expect(correctionSemantic, `${label}: مراجعة المنقوص لم تثبت نوع الاسم`)
              .toContain("اسم منقوص");
          }

          if (topic.code === "munada") {
            expect(correctionSemantic, `${label}: مراجعة المنادى لم تثبت نوع الباب`)
              .toContain("منادى");
          }

          if (topic.code === "la-nafiya") {
            expect(correctionSemantic, `${label}: مراجعة لا النافية لم تثبت اسم لا`)
              .toMatch(/اسم .*لا/u);
          }

          expect(route.steps.length, `${label}: لا توجد خطوات تصحيح`).toBeGreaterThan(0);
          expect(route.steps.length, `${label}: التصحيح أطول من أربع خطوات`).toBeLessThanOrEqual(4);
          expect(normalized(route.finalAnswer), `${label}: النتيجة المصححة لا تطابق النتيجة المعتمدة`)
            .toBe(normalized(expected));

          expect(correction, `${label}: التصحيح يعيد تشخيص اختيار الطالب`)
            .not.toMatch(/اختيارك/u);
          expect(correction, `${label}: التصحيح يعيد الطالب إلى السؤال بدل شرح الحل`)
            .not.toMatch(/عد إلى السؤال|عد للسؤال|عد واختر|راجع السؤال/u);
          expect(correction, `${label}: التصحيح يحتوي أمرا إجرائيا بدل خطوة حل`)
            .not.toMatch(/لا تعد|طبّق|طبق .* ثم عد/u);
          expect(correction, `${label}: ظهر رمز برمجي للطالب`)
            .not.toMatch(/\b(?:nasb|jazm|raf3|jarr|niswa|tawkid|alif2|yaa|sahih)\b/iu);
          expect(correction, `${label}: التصحيح منته بنص مبتور`)
            .not.toMatch(/[:：؛،]\s*$|\.\.\.\s*$|…\s*$/u);
          expect(route.finalAnswer, `${label}: النتيجة النهائية مبتورة`)
            .not.toMatch(/[:：]\s*$|\.\.\.\s*$|…\s*$/u);

          // الحكم الإعرابي يسبق العلامة، والعلامة يجب أن توافق الحكم.
          const finalText = normalized(route.finalAnswer);
          if (/\bمرفوع\b/u.test(finalText)) {
            expect(finalText, `${label}: نتيجة مرفوعة تذكر علامة نصب/جر`)
              .not.toMatch(/علامة (?:نصبه|جره)/u);
          }
          if (/\bمنصوب\b/u.test(finalText)) {
            expect(finalText, `${label}: نتيجة منصوبة تذكر علامة رفع/جر`)
              .not.toMatch(/علامة (?:رفعه|جره)/u);
          }
          if (/\bمجرور\b/u.test(finalText)) {
            expect(finalText, `${label}: نتيجة مجرورة تذكر علامة رفع/نصب`)
              .not.toMatch(/علامة (?:رفعه|نصبه)/u);
          }
          if (/\bمجزوم\b/u.test(finalText)) {
            expect(finalText, `${label}: نتيجة مجزومة تذكر علامة رفع/نصب`)
              .not.toMatch(/علامة (?:رفعه|نصبه)/u);
          }

          // الوظائف ذات الحكم الثابت لا يجوز أن تحمل حكما يناقضها.
          expect(finalText, `${label}: الفاعل أو نائب الفاعل لا يكون منصوبا أو مجرورا`)
            .not.toMatch(/(?:فاعل|نائب فاعل)[^.!؟،؛]{0,40}(?:منصوب|مجرور)/u);
          expect(finalText, `${label}: المفعول به لا يكون مرفوعا أو مجرورا`)
            .not.toMatch(/مفعول به[^.!؟،؛]{0,40}(?:مرفوع|مجرور)/u);
          expect(finalText, `${label}: المضاف إليه لا يكون مرفوعا أو منصوبا`)
            .not.toMatch(/مضاف إليه[^.!؟،؛]{0,40}(?:مرفوع|منصوب)/u);

          // الاسم المضاف إلى ياء المتكلم معرب، فلا نصف الاسم نفسه بأنه مبني.
          if (/ياء المتكلم/u.test(finalText)) {
            const target = simpleTarget(example.target);
            if (target) {
              const targetPattern = new RegExp(
                `${target.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}[^.!؟،؛]{0,35}مبني`,
                "u",
              );
              expect(finalText, `${label}: الاسم المضاف إلى ياء المتكلم وُصف بأنه مبني`)
                .not.toMatch(targetPattern);
            }
          }

          // المصدر المؤول أو الجملة/شبه الجملة تُعالج بوصفها تركيبا ذا محل عند الحاجة.
          if (/مصدر مؤول/u.test(finalText)) {
            expect(finalText, `${label}: المصدر المؤول وُصف بأنه كلمة مبنية`)
              .not.toMatch(/الكلمة مبنية/u);
          }
        }

        // مسار التصحيح canonical واحد مهما كان المشتت.
        if (routes.length >= 2) {
          expect(
            new Set(routes.map((route) => normalized(route.steps.join(" ")))).size,
            `${label}: التصحيح يتغير باختلاف المشتت`,
          ).toBe(1);
        }

        // كشف اسم قديم/متسرب قبل النتيجة عندما تكون النتيجة موسومة باسم الكلمة نفسها.
        const target = simpleTarget(example.target);
        const scope = practiceOptionScope(expected);
        if (target && ["role", "verb", "case"].includes(scope)) {
          const prefix = String(expected).match(/^([^:：]{1,32})[:：]\s*/u)?.[1]?.trim() || "";
          const grammarLabels = /^(?:الفاعل|علامة|نون النسوة|نون التوكيد|ألف الاثنين|واو الجماعة|ياء المخاطبة|التاء|تاء التأنيث|الهاء)$/u;
          if (prefix && !grammarLabels.test(prefix)) {
            expect(
              normalized(prefix),
              `${label}: اسم النتيجة لا يطابق الكلمة المستهدفة`,
            ).toBe(normalized(target));
          }
        }
      }
    }
  }, 30_000);
});
