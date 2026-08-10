import { describe, expect, test } from "vitest";
import {
  customKanaPedagogyNode,
  customKanaResultNode,
  kanaNasikhFinalIntro,
} from "../app/components/exercise/KanaPedagogy";
import { dialogueQuestionText } from "../app/components/exercise/ExercisePedagogy";
import { cleanKanaTree } from "../content/trees/clean_kana";
import {
  customInnaResultNode,
  innaGenericLabel,
  innaNasikhFinalIntro,
} from "../app/components/exercise/InnaPedagogy";

describe("وحدات العرض التربوي للناسخين", () => {
  test("يبني سؤال كان من ألفاظ المثال نفسه", () => {
    const node = customKanaPedagogyNode(
      { id: "kana_target", type: "question", answers: [] },
      {
        currentSentence: "كان الطالبُ مجتهدًا.",
        currentTarget: "الطالبُ",
        facts: { targetRole: "ism", nounKind: "mu3rab" },
      }
    );
    expect(node?.text).toContain("أيُّ كلمة هي صاحبة معنى (كان)");
    expect(node?.answers?.filter((answer: any) => answer.correct)).toHaveLength(1);
    expect(node?.answers?.find((answer: any) => answer.correct)?.text).toBe("الطالبُ");
    expect(dialogueQuestionText(node, "الطالبُ", "learn", {
      currentSentence: "كان الطالبُ مجتهدًا.",
      currentTarget: "الطالبُ",
      facts: { targetRole: "ism", nounKind: "mu3rab" },
    }, cleanKanaTree)).toBe("أيُّ كلمة هي صاحبة معنى (كان) في الجملة؟");
  });

  test("يميّز الناسخ من الكلمة الكاملة ولا يلتقط بات من الطالبات", () => {
    const node = customKanaPedagogyNode(
      { id: "kana_target", type: "question", text: "", answers: [] },
      {
        currentSentence: "كانت الطالباتُ مجتهداتٍ.",
        currentTarget: "مجتهداتٍ",
        facts: { targetRole: "khabar", khabarKind: "single", nounKind: "mu3rab" },
      }
    );
    expect(node?.text).toContain("(مجتهداتٍ) بـ(الطالبات)");
    expect(node?.answers?.map((answer) => String(answer.text)).join(" ")).toContain("صاحب معنى (كانت)");
    expect(node?.answers?.map((answer) => String(answer.text)).join(" ")).not.toContain("صاحب معنى (بات)");
  });

  test("يربط الخبر المقدم باسم الناسخ المؤخر الصحيح", () => {
    const node = customKanaPedagogyNode(
      { id: "kana_target", type: "question", text: "", answers: [] },
      {
        currentSentence: "كان في البيتِ رجلٌ.",
        currentTarget: "في البيتِ",
        facts: { targetRole: "khabar", khabarKind: "shibh", shibhType: "jar", shibhPosition: "advanced" },
      }
    );
    expect(node?.text).toContain("(في البيتِ) بـ(رجل)");
    expect(node?.answers?.find((answer) => answer.correct)?.text).toContain("(رجل)");
  });

  test("يفصّل خبر كان الجملة الاسمية بدل الاكتفاء بالحكم العام", () => {
    const result = customKanaResultNode(
      { id: "R_kana_khabar_nominal_sentence", type: "result", text: "نتيجة" },
      { currentSentence: "أصبح الطريقُ أطرافُه ممتدةٌ.", currentTarget: "أطرافه ممتدة" }
    );
    expect(result?.text).toContain("مبتدأ ثانٍ");
    expect(result?.text).toContain("في محل نصب خبر الفعل الناسخ");
  });

  test("يخصص اسم إن وخبرها بحسب الحرف الناسخ", () => {
    expect(innaGenericLabel("اسم إن منصوب وخبر إن مرفوع", { facts: { particleLabel: "لعلَّ" } }))
      .toBe("اسم لعل منصوب وخبر لعل مرفوع");
    expect(innaNasikhFinalIntro({ currentSentence: "لعلَّ الفرجَ قريبٌ", facts: { particleLabel: "لعلَّ" } }))
      .toContain("لعلَّ: حرف نصب وترجٍّ");
  });

  test("يشرح إنما بوصفها مكفوفة عن العمل", () => {
    const text = innaNasikhFinalIntro({
      currentSentence: "إنما المؤمنون إخوةٌ",
      facts: { particleLabel: "إنما" },
    });
    expect(text).toContain("مكفوف عن العمل");
    expect(text).toContain("ما) الكافة");

    const result = customInnaResultNode(
      { id: "R_inna_kaffa_mubtada", type: "result", text: "نتيجة" },
      { currentTarget: "المؤمنون", currentSentence: "إنما المؤمنون إخوةٌ", facts: { particleLabel: "إنما" } }
    );
    expect(result?.text).toContain("مبتدأ مرفوع");
    expect(result?.text).toContain("لا تعمل عمل إن");
  });

  test("يضبط بناء الفعل الناسخ في المقدمة النهائية", () => {
    expect(kanaNasikhFinalIntro({ currentSentence: "ما انفكوا يتناوبون" })).toContain("مبني على الضم");
    expect(kanaNasikhFinalIntro({ currentSentence: "أصبحن مجتهدات" })).toContain("مبني على السكون");
  });
});
