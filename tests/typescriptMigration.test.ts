import fs from "node:fs";
import path from "node:path";
import { describe, expect, test } from "vitest";

const root = process.cwd();
const SOURCE_ROOTS = ["app", "lib", "content", "data"];

function collectSourceFiles(directory: string): string[] {
  const absolute = path.join(root, directory);
  if (!fs.existsSync(absolute)) return [];
  return fs.readdirSync(absolute, { withFileTypes: true }).flatMap((entry) => {
    const relative = path.join(directory, entry.name);
    if (entry.isDirectory()) return collectSourceFiles(relative);
    return [relative];
  });
}

const SOURCE_FILES = SOURCE_ROOTS.flatMap(collectSourceFiles);
const LEGACY_JAVASCRIPT_FILES = SOURCE_FILES.filter((file) => /\.(?:js|jsx)$/.test(file));
const TYPESCRIPT_SOURCE_FILES = SOURCE_FILES.filter((file) => /\.tsx?$/.test(file));

describe("اكتمال الانتقال إلى TypeScript", () => {
  test("لا تبقى ملفات JavaScript أو JSX في شيفرة المشروع", () => {
    expect(LEGACY_JAVASCRIPT_FILES).toEqual([]);
  });

  test("إعدادات المشروع تمنع عودة ملفات JavaScript", () => {
    const tsconfig = JSON.parse(fs.readFileSync(path.join(root, "tsconfig.json"), "utf8"));
    expect(tsconfig.compilerOptions.allowJs).toBe(false);
  });

  test("الفحص الصارم يشمل جميع ملفات المصدر لا وحدات مختارة فقط", () => {
    const strictConfig = JSON.parse(fs.readFileSync(path.join(root, "tsconfig.strict.json"), "utf8"));
    expect(strictConfig.include).toEqual(expect.arrayContaining([
      "app/**/*.ts",
      "app/**/*.tsx",
      "lib/**/*.ts",
      "content/**/*.ts",
      "data/**/*.ts",
    ]));
  });
  test("لا تعود الأنواع العامة any إلى ملفات المصدر", () => {
    const offenders = TYPESCRIPT_SOURCE_FILES.filter((file) => /\bany\b/.test(fs.readFileSync(path.join(root, file), "utf8")));
    expect(offenders).toEqual([]);
  });

});
