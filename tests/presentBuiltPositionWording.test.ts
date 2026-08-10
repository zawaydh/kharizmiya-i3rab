import { describe, expect, it } from "vitest";
import {
  presentVerbBuiltPositionNote,
  presentVerbBuiltResult,
} from "../lib/presentVerbBuiltPosition";

describe("صياغة محل الفعل المضارع المبني", () => {
  it("يذكر الفعل صراحة حتى لا يختلط المحل بالضمير المتصل", () => {
    expect(presentVerbBuiltPositionNote("none")).toBe(
      "الفعل هو في محل رفع؛ لأنه لم يُسبق بناصب أو جازم.",
    );
    expect(presentVerbBuiltPositionNote("nasb")).toBe(
      "الفعل هو في محل نصب؛ لأنه سُبق بناصب.",
    );
    expect(presentVerbBuiltPositionNote("jazm")).toBe(
      "الفعل هو في محل جزم؛ لأنه سُبق بجازم.",
    );
  });

  it("يفصل ملاحظة محل الفعل عن إعراب نون النسوة", () => {
    const result = presentVerbBuiltResult({ build: "niswa", tool: "none" });
    expect(result).toContain("ملاحظة: الفعل هو في محل رفع");
    expect(result).toContain("نون النسوة: ضمير متصل مبني على الفتح في محل رفع فاعل");
  });
});
