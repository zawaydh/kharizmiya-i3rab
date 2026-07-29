import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(process.cwd());
const componentPath = resolve(root, "app/components/DynamicPathTree.tsx");
const pathsCssPath = resolve(root, "app/paths/paths-original.css");
const finalSystemPath = resolve(root, "app/styles/80-clean-system.css");

function channel(value: number) {
  const normalized = value / 255;
  return normalized <= 0.04045
    ? normalized / 12.92
    : Math.pow((normalized + 0.055) / 1.055, 2.4);
}

function luminance(hex: string) {
  const value = hex.replace("#", "");
  const r = channel(Number.parseInt(value.slice(0, 2), 16));
  const g = channel(Number.parseInt(value.slice(2, 4), 16));
  const b = channel(Number.parseInt(value.slice(4, 6), 16));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(foreground: string, background: string) {
  const a = luminance(foreground);
  const b = luminance(background);
  const lighter = Math.max(a, b);
  const darker = Math.min(a, b);
  return (lighter + 0.05) / (darker + 0.05);
}

describe("واجهة المسارات البصرية", () => {
  it("تعرض المسار تدريجيًا مع إمكانية فتح الخريطة كاملة", () => {
    const source = readFileSync(componentPath, "utf8");
    expect(source).toContain("showFullMap");
    expect(source).toContain("visibleNodeIds");
    expect(source).toContain("visibleEdgeKeys");
    expect(source).toContain("عرض الخريطة كاملة");
    expect(source).toContain("العودة إلى المسار");
  });

  it("يبقي خطوة المثال التالي ظاهرة بعد النتيجة", () => {
    const source = readFileSync(componentPath, "utf8");
    expect(source).toContain("انتقل إلى المثال التالي");
    expect(source.indexOf("paths-final-result-card")).toBeLessThan(
      source.indexOf("paths-react-canvas-shell"),
    );
  });

  it("يستخدم ملفًا واحدًا فقط لتنسيق لوحة المسارات", () => {
    const pathsCss = readFileSync(pathsCssPath, "utf8");
    const finalSystem = readFileSync(finalSystemPath, "utf8");
    expect(pathsCss).toContain(".paths-react-canvas-scroll");
    expect(pathsCss).toContain(".paths-example-strip");
    expect(finalSystem).not.toContain(".paths-react-head");
    expect(finalSystem).not.toContain(".paths-react-canvas-scroll");
  });

  it("لا يعيد نظام مساحة العمل العام إلى مكوّن المسارات", () => {
    const source = readFileSync(componentPath, "utf8");
    expect(source).toContain('className="card paths-react-card"');
    expect(source).not.toContain("paths-activity-frame");
  });

  it("يحافظ على تباين النصوص داخل اللوحة والعقد والنتيجة", () => {
    expect(contrast("#172033", "#ffffff")).toBeGreaterThanOrEqual(4.5);
    expect(contrast("#5b697b", "#ffffff")).toBeGreaterThanOrEqual(4.5);
    expect(contrast("#0f766e", "#edf9f8")).toBeGreaterThanOrEqual(4.5);
    expect(contrast("#4f3a05", "#fff7d6")).toBeGreaterThanOrEqual(4.5);
    expect(contrast("#ffffff", "#137f7a")).toBeGreaterThanOrEqual(4.5);
  });
});
