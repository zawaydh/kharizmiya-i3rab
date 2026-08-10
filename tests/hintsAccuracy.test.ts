import { describe, expect, test } from "vitest";
import { firstLevelHintText } from "../lib/hintText";
import { studentHintText } from "../app/components/exercise/ExercisePedagogy";
import { cleanKanaTree } from "../content/trees/clean_kana";
import { firstWordTree } from "../content/trees/first_word";
import { presentVerbTree } from "../content/trees/verb_present";
import { pastVerbTree } from "../content/trees/verb_past";
import { imperativeVerbTree } from "../content/trees/verb_imperative";
import { ismManqousTree } from "../content/trees/ism_manqous";
import { tawabiTree } from "../content/trees/tawabi";
import startExamples from "../data/interactive_examples.json";
import type { QuestionNode } from "../lib/exercise/model";

describe("دقة التلميحات وارتباطها بالعقد", () => {
  test("يفحص اسم كان في الجملة كلها ولا يحكم من الكلمة التالية فقط", () => {
    const text = firstLevelHintText("kana_hidden_ism_site", "", "هو", "هل ظهر اسم صريح؟");
    expect(text).toContain("الجملة كلها");
    expect(text).toContain("خبر مقدم");
    expect(text).not.toContain("مباشرة");

    const node = cleanKanaTree.nodes.kana_hidden_ism_site as QuestionNode;
    expect(node.hint).toContain("كان في البيت رجلٌ");
    expect(node.answers[0].hint).toContain("حتى نهاية الجملة");
  });

  test("يخصص تلميح خبر كان لصورة الخبر", () => {
    const text = firstLevelHintText("kana_khabar_entry", "", "في البيت", "ما صورة خبر الفعل الناسخ؟");
    expect(text).toContain("خبر مفرد");
    expect(text).toContain("جملة اسمية");
    expect(text).toContain("جملة فعلية");
    expect(text).toContain("شبه جملة");
    expect(text).not.toContain("ما الدور الذي أدته");
  });

  test("يذكر جميع متصلات فعل الأمر الموجودة في العقدة", () => {
    const text = firstLevelHintText("imperative_attached_kind", "", "اكتبا", "ما نوع المتصل؟");
    for (const part of ["نون النسوة", "نون التوكيد", "ألف الاثنين", "واو الجماعة", "ياء المخاطبة"]) {
      expect(text).toContain(part);
    }
    expect(imperativeVerbTree.nodes.imperative_attached_kind.answers).toHaveLength(5);
  });


  test("يخصص تلميح حرف العلة المحذوف وتصحيحه للنقرة في فعل الأمر", () => {
    const firstHint = firstLevelHintText("imperative_weak_letter", "", "ادعُ", "ما حرف العلة المحذوف؟");
    expect(firstHint).toContain("هو يدعو");
    expect(firstHint).not.toContain("المحذوف هو الواو");

    const node = imperativeVerbTree.nodes.imperative_weak_letter;
    expect(node?.type).toBe("question");
    if (!node || node.type !== "question") {
      throw new Error("عقدة حرف العلة في فعل الأمر ليست عقدة سؤال");
    }

    const cases = [
      { target: "ادعُ", presentBase: "يدعو", weakLetter: "waw", wrong: "الألف", expected: "الواو" },
      { target: "ارمِ", presentBase: "يرمي", weakLetter: "ya", wrong: "الواو", expected: "الياء" },
      { target: "اسعَ", presentBase: "يسعى", weakLetter: "alif", wrong: "الياء", expected: "الألف" },
    ] as const;

    for (const item of cases) {
      const picked = node.answers.find((answer) => answer.text === item.wrong);
      expect(picked, `خيار ${item.wrong} غير موجود في عقدة حرف العلة`).toBeTruthy();
      const text = studentHintText(node, picked, {
        currentTarget: item.target,
        facts: { weakLetter: item.weakLetter, presentBase: item.presentBase },
      });
      expect(text).toContain(`اخترتَ ${item.wrong}`);
      expect(text).toContain(`هو «${item.presentBase}»`);
      expect(text).toContain(`الحرف المحذوف هو ${item.expected}`);
    }
  });

  test("لا يعرض تلميح الصورة خيارات من خارج العقدة", () => {
    const text = firstLevelHintText("fael_mu3rab_shape", "", "المعلمان", "ما صورة الفاعل؟");
    expect(text).toContain("مفرد");
    expect(text).toContain("مثنى");
    expect(text).toContain("جمع تكسير");
    expect(text).toContain("الأسماء الخمسة");
    expect(text).not.toContain("اسم مبني");
    expect(text).not.toContain("تركيب");
  });

  test("لا يقطع تلميح اسم إن ولا تلميح نوع المبتدأ", () => {
    const inna = firstLevelHintText("inna_ism_start", "", "الطالبَ", "ما طبيعة اسم الحرف الناسخ؟");
    expect(inna).toContain("اسم معرب");
    expect(inna).toContain("ضمير متصل");
    expect(inna).toContain("اسم مبني");
    expect(inna).toContain("يؤول بمصدر");
    expect(inna).not.toContain("…");

    const mubtada = firstLevelHintText("mubtada_word_type", "", "العلم", "ما نوع الكلمة؟");
    expect(mubtada).toContain("اسم أو في معنى الاسم");
    expect(mubtada).toContain("فعل");
    expect(mubtada).toContain("حرف");
    expect(mubtada).not.toContain("…");
  });

  test("يربط تلميح الحرف بما بعده", () => {
    const hint = firstWordTree.nodes.fw_particle_after.hint;
    expect(hint).toContain("الكلمة التي جاءت بعد الحرف");
    expect(hint).toContain("حدث وزمن");
    expect(hint).not.toBe("الحرف يوجّه ما بعده.");
  });

  test("يتعامل مع أدوات المضارع المتصلة بحرف عطف أو استئناف", () => {
    const hint = presentVerbTree.nodes.present_tool_presence.hint;
    expect(hint).toContain("فلن");
    expect(hint).toContain("ولم");
  });

  test("لا يعتمد اتصال الماضي على زيادة طول الكلمة", () => {
    const hint = pastVerbTree.nodes.past_has_attachment.hint;
    expect(hint).toContain("لا تعتمد على طول الكلمة");
    expect(hint).toContain("نون النسوة");
  });

  test("يحافظ على ترتيب الاسم المنقوص: أل ثم الإضافة ثم الحالة", () => {
    expect(ismManqousTree.startNodeId).toBe("manqous_identity");
    const al = ismManqousTree.nodes.manqous_has_al as QuestionNode;
    const added = ismManqousTree.nodes.manqous_is_added as QuestionNode;
    const indef = ismManqousTree.nodes.manqous_indef_case as QuestionNode;
    expect(al.text).toContain("معرّف بـ«الـ»");
    expect(added.text).toContain("مضاف");
    expect(indef.hint).toContain("في النصب تثبت الياء");
    expect(indef.hint).toContain("الرفع والجر فتحذف الياء");
  });

  test("يقيد قاعدة الإحلال بالبدل المطابق", () => {
    const hint = tawabiTree.nodes.tawabi_relation.hint;
    expect(hint).toContain("البدل المطابق");
    expect(hint).toContain("بدل البعض والاشتمال");
  });

  test("يعطي مثال فعل الأمر في البداية دليلاً على السكون", () => {
    const example = (startExamples as any[]).find((item) => item.id === "imperative");
    const step = example.steps.find((item: any) => item.id === "build");
    expect(step.hint).toContain("لم يتصل");
    expect(step.hint).toContain("حرف صحيح");
    expect(step.hint).not.toContain("اختر العلامة الناتجة عن المسار");
  });
});

describe("تنظيف الفروع غير المدعومة", () => {
  test("لا يقدّم الضمير المنفصل بوصفه اسمًا قياسيًا لإن", async () => {
    const { cleanInnaTree } = await import("../content/trees/clean_inna");
    const rawAnswers = cleanInnaTree.nodes.inna_ism_built.answers;
    const choices = Array.isArray(rawAnswers)
      ? rawAnswers.map((answer) =>
          typeof answer === "object" && answer !== null && "text" in answer
            ? String(answer.text)
            : "",
        )
      : [];
    expect(choices).not.toContain("ضمير منفصل");
    expect(cleanInnaTree.nodes.R_inna_ism_damir).toBeUndefined();
  });
});
