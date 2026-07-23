import { describe, expect, test } from "vitest";
import { TOPICS } from "../lib/topics";
import interactiveExamples from "../data/interactive_examples.json";

const descriptiveTargetIds = new Set([
  "fa-10",
  "fa-11",
  "fa-12",
  "fa-13",
  "fa-14",
  "fa-15",
  "mf-09",
  "mf-10",
  "mf-11",
  "ka-04b",
]);

function findExample(id: string) {
  for (const topic of TOPICS as any[]) {
    const example = (topic.examples || []).find((item: any) => item.id === id);
    if (example) return example;
  }
  return null;
}

describe("الاتساق اللغوي والحركي", () => {
  test("لا تبقى الصيغ الإملائية والحركية المصححة بصورتها القديمة", () => {
    const serialized = JSON.stringify({ topics: TOPICS, interactiveExamples });
    const forbidden = [
      "عليٌ",
      "عليًا",
      "عليٍ",
      "إياكَ",
      "مضَوا",
      "بقُوا",
      "رتبتِ الطالباتُ",
      "الصدق الصدقُ",
      "كرّمتُ الطالب الطالبَ",
      "مررتُ بالطالب الطالبِ",
      "اكتبنَّ الدرسَ",
      "أذاكرنَّ الدرسَ",
      "أنَّ",
      "إنَّ",
    ];

    for (const oldForm of forbidden) {
      expect(serialized, `بقيت الصيغة القديمة: ${oldForm}`).not.toContain(oldForm);
    }
  });

  test("الكلمة المستهدفة البسيطة تطابق الجملة بحركاتها كاملة", () => {
    for (const topic of TOPICS as any[]) {
      for (const example of topic.examples || []) {
        if (descriptiveTargetIds.has(example.id)) continue;
        const sentence = String(example.sentence || "");
        const target = String(example.target || "");
        expect(
          sentence.includes(target),
          `${topic.code}/${example.id}: الهدف «${target}» غير موجود كاملًا في «${sentence}»`
        ).toBe(true);

        const start = sentence.indexOf(target);
        const following = sentence.slice(start + target.length, start + target.length + 1);
        expect(
          following && /[\u064B-\u065F\u0670]/.test(following),
          `${topic.code}/${example.id}: بقيت حركة خارج الكلمة المستهدفة «${target}${following}»`
        ).toBeFalsy();
      }
    }
  });

  test("الأمثلة المصححة الأساسية محفوظة بصيغتها الدقيقة", () => {
    expect(findExample("pr-04")?.sentence).toBe("إيّاكَ نعبدُ.");
    expect(findExample("tw-04")?.target).toBe("عليٌّ");
    expect(findExample("tw-05")?.target).toBe("عليًّا");
    expect(findExample("tw-06")?.sentence).toBe("سلَّمتُ على خالدٍ وعليٍّ.");
    expect(findExample("tw-09-lf-raf3")?.sentence).toBe("الصدقُ الصدقُ منجاةٌ.");
    expect(findExample("tw-09-lf-nasb")?.sentence).toBe("كرّمتُ الطالبَ الطالبَ.");
    expect(findExample("tw-09-lf-jarr")?.sentence).toBe("مررتُ بالطالبِ الطالبِ.");
    expect(findExample("pv-13")?.target).toBe("مَضَوْا");
    expect(findExample("pv-14")?.target).toBe("بَقُوا");
    expect(findExample("im-fath-tawkid")?.target).toBe("اكتبَنَّ");
    expect(findExample("pr-binaa-tawkid")?.target).toBe("أذاكرَنَّ");
    expect(findExample("in-28")?.target).toBe("المؤمنونَ");
  });
});
