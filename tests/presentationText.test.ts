import { describe, expect, it } from "vitest";
import {
  extractTopicName,
  firstLine,
  getStageMeta,
  i3rabTokensFromDraft,
  shortStudentText,
  stageLearningTitle,
} from "../app/components/exercise/exercisePresentationText";

describe("exercise presentation text", () => {
  it("returns clear metadata for each stage", () => {
    expect(getStageMeta("learn").badge).toBe("التعلّم الموجّه");
    expect(getStageMeta("practice").nextHrefPrefix).toBe("/quiz/");
    expect(getStageMeta("quiz").nextLabel).toBe("");
  });

  it("extracts the topic name before the dash", () => {
    expect(extractTopicName("المبتدأ — التعلّم الموجّه")).toBe("المبتدأ");
    expect(extractTopicName("")).toBe("الموضوع");
  });

  it("builds a stage title with the visible stage name", () => {
    expect(stageLearningTitle("التدريب", "الخبر — المستوى الأول")).toBe("التدريب — الخبر");
    expect(stageLearningTitle("غير معروف", "الفاعل")).toBe("التعلّم الموجّه — الفاعل");
  });

  it("splits an i3rab draft into visible tokens", () => {
    expect(i3rabTokensFromDraft("مبتدأ مرفوع بالضمة")).toEqual(["مبتدأ", "مرفوع", "بالضمة"]);
    expect(i3rabTokensFromDraft("ابدأ الحل")).toEqual([]);
  });

  it("returns only the first line and shortens long feedback", () => {
    expect(firstLine("السطر الأول\nالسطر الثاني")).toBe("السطر الأول");
    expect(shortStudentText("💡 ")).toBe("جرّب مرة أخرى.");
    expect(shortStudentText("أ".repeat(90)).length).toBeLessThanOrEqual(72);
  });
});
