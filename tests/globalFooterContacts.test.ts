import fs from "node:fs";
import path from "node:path";
import { describe, expect, test } from "vitest";

const read = (file: string) =>
  fs.readFileSync(path.join(process.cwd(), file), "utf8");

describe("GLOBAL_FOOTER_CONTACTS", () => {
  test("الفوتر ظاهر على جميع المسارات ولا يعتمد إخفاءً حسب الصفحة", () => {
    const source = read("app/components/RouteAwareFooter.tsx");
    expect(source).not.toContain("usePathname");
    expect(source).not.toContain("HIDDEN_DURING_WORK");
    expect(source).toContain("<footer className=\"footer\">");
  });

  test("الفوتر يحتوي روابط يوتيوب وواتساب الصحيحة", () => {
    const source = read("app/components/RouteAwareFooter.tsx");
    expect(source).toContain("https://www.youtube.com/@%D8%A5%D8%B9%D8%B1%D8%A7%D8%A8%D9%83");
    expect(source).toContain("https://wa.me/962799127434");
    expect(source).toContain("0799127434");
  });
});
