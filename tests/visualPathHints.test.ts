import { describe, expect, it } from "vitest";
import { visualPathWrongHint } from "../app/components/visual-path/hints";
import type { PositionedNode, VisualChoice } from "../app/components/visual-path/types";

function node(id: string, text: string): PositionedNode {
  return { id, kind: "decision", text, x: 0, y: 0, w: 310, h: 180 };
}

function choice(id: string, label: string): VisualChoice {
  return { id, label, action: { targetId: "next" } };
}

describe("تلميحات المسارات البصرية", () => {
  it("يخصص تلميح الأفعال الخمسة للخيار الخاطئ دون كشف الإجابة", () => {
    const hint = visualPathWrongHint(
      node("present:nasb:five", "هل الفعل «يدرسا» من الأفعال الخمسة؟"),
      choice("present:nasb:five:no", "لا"),
      {
        sentence: "لن يدرسا الدرسَ.",
        target: "يدرسا",
        facts: { shape: "five", tool: "nasb", attached: "alif2" },
      },
    );
    expect(hint).toContain("اختيار «لا»");
    expect(hint).toContain("غياب ألف الاثنين وواو الجماعة وياء المخاطبة");
    expect(hint).toContain("الأفعال الخمسة أفعال مضارعة اتصلت");
    expect(hint).toContain("ألف الاثنين");
    expect(hint).not.toContain("الإجابة الصحيحة");
  });

  it("تربط تلميح العامل بالفعل لا بالضمير المتصل", () => {
    const hint = visualPathWrongHint(
      node("present:niswa:factor", "هل سُبق الفعل «يشرحْنَ» بـ…؟"),
      choice("present:niswa:factor:nasb", "ناصب"),
      {
        sentence: "المعلماتُ يشرحْنَ الدرسَ.",
        target: "يشرحْنَ",
        facts: { buildConnection: "niswa", tool: "none", hasTool: false },
      },
    );
    expect(hint).toContain("اختيار «ناصب»");
    expect(hint).toContain("وجود أداة نصب مؤثرة مباشرة قبل الفعل");
    expect(hint).toContain("اتصال النون يحدد بناء الفعل");
    expect(hint).toContain("العامل السابق فيحدد محله");
    expect(hint).not.toContain("في محل رفع");
  });

  it("يرد فعل الأمر إلى المخاطب المفرد عند فحص المتصل", () => {
    const hint = visualPathWrongHint(
      node("imperative_connection", "ما حال آخر فعل الأمر «اكتبوا»؟"),
      choice("imperative_connection:none", "لم يتصل به شيء"),
      {
        sentence: "اكتبوا الدرسَ.",
        target: "اكتبوا",
        facts: { attached: "waw", ending: "sahih" },
      },
    );
    expect(hint).toContain("المخاطب المفرد «أنتَ»");
    expect(hint).toContain("صيغة الأمر المفرد");
    expect(hint).not.toContain("المضارع مع «هو»");
  });

});
