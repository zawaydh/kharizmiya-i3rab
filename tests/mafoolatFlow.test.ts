import { describe, expect, it } from "vitest";
import { getTopicByCode } from "../lib/topics";
import { evaluateAnswer, resolveAnswerNext } from "../lib/exercise/engine";
import type { ExerciseExample, QuestionNode } from "../lib/exercise/model";
import { mafoolatStudentHintText } from "../app/components/exercise/MafoolatStudentHints";
import { studentHintText } from "../app/components/exercise/ExerciseStudentHints";
import { openingDialogueLine } from "../app/components/exercise/ExerciseOpeningDialogue";
import { finalThinkingTextForDisplay, normalizeThinkingNode } from "../app/components/exercise/ExerciseNodePedagogy";

function topic() {
  const value = getTopicByCode("mafoolat");
  expect(value).toBeTruthy();
  return value!;
}

function example(id: string) {
  const value = topic().examples.find((item: ExerciseExample) => item.id === id);
  expect(value, id).toBeTruthy();
  return value!;
}

function pedagogyState(ex: ExerciseExample) {
  return {
    facts: ex.facts || {},
    currentTarget: ex.target || "",
    currentSentence: ex.sentence || "",
    sentence: ex.sentence || "",
  } as never;
}

function correctNext(nodeId: string, ex: ExerciseExample) {
  const node = topic().tree.nodes[nodeId] as QuestionNode;
  expect(node?.type).toBe("question");
  const correct = node.answers.filter((answer) => evaluateAnswer(answer, ex.facts || {}));
  expect(correct, `${ex.id}/${nodeId}`).toHaveLength(1);
  return resolveAnswerNext(correct[0]!, ex.facts || {});
}

describe("تسلسل تحديد نوع المفعول", () => {
  it("يفحص المعية ثم الظرف ثم المصدر ثم السبب ثم المفعول به", () => {
    expect(topic().tree.startNodeId).toBe("mafoolat_maah_check");

    const bih = example("mfs-07");
    expect(correctNext("mafoolat_maah_check", bih)).toBe("mafoolat_fih_check");
    expect(correctNext("mafoolat_fih_check", bih)).toBe("mafoolat_mutlaq_check");
    expect(correctNext("mafoolat_mutlaq_check", bih)).toBe("mafoolat_liajlih_check");
    expect(correctNext("mafoolat_liajlih_check", bih)).toBe("mafoolat_bih_check");
    expect(correctNext("mafoolat_bih_check", bih)).toBe("mafoolat_form");
  });

  it("يتوقف عند النوع المكتشف ثم يعود إلى صورة الكلمة", () => {
    expect(correctNext("mafoolat_maah_check", example("mfs-01"))).toBe("mafoolat_form");
    expect(correctNext("mafoolat_fih_check", example("mfs-02"))).toBe("mafoolat_form");
    expect(correctNext("mafoolat_mutlaq_check", example("mfs-04"))).toBe("mafoolat_form");
    expect(correctNext("mafoolat_liajlih_check", example("mfs-06"))).toBe("mafoolat_form");
  });

  it("يحدد العلامة بعد الموقع من نوع الاسم", () => {
    const dualMutlaq = example("mfs-05");
    expect(correctNext("mafoolat_form", dualMutlaq)).toBe("mafoolat_word_inflection");
    expect(correctNext("mafoolat_word_inflection", dualMutlaq)).toBe("mafoolat_shape");
    expect(correctNext("mafoolat_shape", dualMutlaq)).toBe("mafoolat_mark");
    expect(correctNext("mafoolat_mark", dualMutlaq)).toBe("R_mafoolat_mu3rab");
    expect(String(dualMutlaq.facts?.finalI3rab)).toContain("الياء لأنه مثنى");
  });

  it("لا يجعل المفعول به نتيجة افتراضية ويختم بخريطة المنصوبات الأخرى", () => {
    const hal = example("mfs-15");
    const tamyiz = example("mfs-16");
    expect(correctNext("mafoolat_bih_check", hal)).toBe("R_mafoolat_remaining_accusatives");
    expect(correctNext("mafoolat_bih_check", tamyiz)).toBe("R_mafoolat_remaining_accusatives");

    const overview = topic().tree.nodes.R_mafoolat_remaining_accusatives;
    const finalText = finalThinkingTextForDisplay(overview as never, pedagogyState(hal));
    expect(finalText).toContain("إذا أجابت عن «كيف؟»");
    expect(finalText).toContain("اسم إنَّ وأخواتها");
    expect(finalText).toContain("خبر كان وأخواتها");
    expect(finalText).toContain("اسم لا النافية للجنس");
    expect(finalText).toContain("المستثنى منصوبًا");
    expect(finalText).toContain("منادى");
    expect(finalText).toContain("تابع منصوب");
  });

  it("يصوغ الأسئلة كسلسلة تفكير مترابطة", () => {
    const ex = example("mfs-12");
    const state = pedagogyState(ex);
    const tree = topic().tree as never;

    expect(openingDialogueLine(tree, topic().tree.nodes.mafoolat_maah_check as never, state, "تحديد نوع المفعول")).toContain("هل سُبقت");
    expect(openingDialogueLine(tree, topic().tree.nodes.mafoolat_fih_check as never, state, "تحديد نوع المفعول")).toContain("استبعدنا المفعول معه");
    expect(openingDialogueLine(tree, topic().tree.nodes.mafoolat_mutlaq_check as never, state, "تحديد نوع المفعول")).toContain("ليست مفعولًا معه ولا مفعولًا فيه");
    expect(openingDialogueLine(tree, topic().tree.nodes.mafoolat_liajlih_check as never, state, "تحديد نوع المفعول")).toContain("ولا مفعولًا مطلقًا");
    expect(openingDialogueLine(tree, topic().tree.nodes.mafoolat_bih_check as never, state, "تحديد نوع المفعول")).toContain("ولا مفعولًا لأجله");
    expect(openingDialogueLine(tree, topic().tree.nodes.mafoolat_form as never, state, "تحديد نوع المفعول")).toContain("الصورة هي التي تحدد العلامة أو المحل");
  });

  it("يعطي تلميحات مرتبطة بالمثال وتشرح سبب الخطأ", () => {
    const ex = example("mfs-12");
    const state = pedagogyState(ex);
    const nodes = topic().tree.nodes;

    expect(mafoolatStudentHintText(nodes.mafoolat_maah_check as never, undefined, state)).toContain("لا توجد واو للمعية");
    expect(mafoolatStudentHintText(nodes.mafoolat_fih_check as never, undefined, state)).toContain("ليست مفعولًا فيه");
    const mutlaqHint = mafoolatStudentHintText(nodes.mafoolat_mutlaq_check as never, undefined, state) || "";
    expect(mutlaqHint).toContain("الرؤية");
    expect(mutlaqHint).toContain("(هذا)");
    expect(mafoolatStudentHintText(nodes.mafoolat_liajlih_check as never, undefined, state)).toContain("ليست مفعولًا لأجله");
    const wrongBihAnswer = (nodes.mafoolat_bih_check as QuestionNode).answers.find((answer) => answer.id === "not-bih");
    const bihHint = mafoolatStudentHintText(nodes.mafoolat_bih_check as never, wrongBihAnswer, state) || "";
    expect(bihHint).toContain("ماذا رأيتُ؟");
    expect(bihHint).toContain("مفعول به");
  });

  it("يعرض الإعراب النهائي الخاص بالمثال بدل النتيجة العامة", () => {
    const ex = example("mfs-12");
    const node = topic().tree.nodes.R_mafoolat_mabni;
    const finalText = finalThinkingTextForDisplay(node as never, pedagogyState(ex));
    expect(finalText).toContain("اسم إشارة مبني في محل نصب مفعول به");
    expect(finalText).not.toContain("هذا: هذا:");
    expect(finalText).not.toContain("بحسب الوظيفة المكتشفة");
  });

  it("يحافظ على سياق عقد المفاعيل الخمسة داخل طبقة العرض", () => {
    const ex = example("mfs-07");
    const raw = topic().tree.nodes.mafoolat_bih_check;
    const normalized = normalizeThinkingNode(raw as never, pedagogyState(ex));
    expect(String(normalized?.context || "")).toContain("استبعدنا المفعول معه");
    expect(String(normalized?.context || "")).toContain("المفعول لأجله");
  });

  it("يغطي ظرف المكان إضافة إلى ظرف الزمان", () => {
    const place = example("mfs-17");
    expect(correctNext("mafoolat_fih_check", place)).toBe("mafoolat_form");
    expect(String(place.facts?.finalI3rab)).toContain("ظرف مكان");
    expect(String(place.facts?.finalI3rab)).toContain("أين جلستُ");
  });

  it("يعرب الضمير المتصل المستهدف نفسه بلا خلط مع نون الوقاية", () => {
    const connected = example("mfs-13");
    expect(connected.target).toBe("كَ");
    expect(String(connected.facts?.finalI3rab)).toContain("الكاف");
    expect(String(connected.facts?.finalI3rab)).toContain("في محل نصب مفعول به");
  });

  it("يحافظ على نتائج نهائية صريحة بلا عبارات عامة", () => {
    for (const ex of topic().examples) {
      const finalI3rab = String(ex.facts?.finalI3rab || "");
      expect(finalI3rab, String(ex.id)).not.toContain("بحسب الوظيفة المكتشفة");
      expect(finalI3rab, String(ex.id)).not.toContain("الموقع الإعرابي");
      expect(finalI3rab.length, String(ex.id)).toBeGreaterThan(25);
    }
  });
  it("يمرر تلميحات المفاعيل الفعلية إلى واجهة الطالب لا إلى الاختبار المباشر فقط", () => {
    const ex = example("mfs-12");
    const state = pedagogyState(ex);
    const node = topic().tree.nodes.mafoolat_mutlaq_check as QuestionNode;
    const wrong = node.answers.find((answer) => answer.id === "mutlaq");
    const hint = studentHintText(node as never, wrong, state) || "";
    expect(hint).toContain("الرؤية");
    expect(hint).toContain("هذا");
    expect(hint).not.toContain("فكّر في السؤال الحالي فقط");
  });

  it("يعطي لكل اختيار خاطئ في العقد التي يمر بها المثال تلميحًا تشخيصيًا غير عام", () => {
    for (const ex of topic().examples) {
      let nodeId = topic().tree.startNodeId;
      const seen = new Set<string>();
      while (!seen.has(nodeId)) {
        seen.add(nodeId);
        const node = topic().tree.nodes[nodeId];
        if (!node || node.type === "result") break;
        const correct = node.answers.filter((answer) => evaluateAnswer(answer, ex.facts || {}));
        expect(correct, `${ex.id}/${nodeId}`).toHaveLength(1);
        for (const wrong of node.answers.filter((answer) => !evaluateAnswer(answer, ex.facts || {}))) {
          const hint = studentHintText(node as never, wrong, pedagogyState(ex)) || "";
          expect(hint.length, `${ex.id}/${nodeId}/${wrong.id}`).toBeGreaterThan(35);
          expect(hint, `${ex.id}/${nodeId}/${wrong.id}`).not.toContain("فكّر في السؤال الحالي فقط");
        }
        nodeId = resolveAnswerNext(correct[0]!, ex.facts || {});
      }
    }
  });

});
