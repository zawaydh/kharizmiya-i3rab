import fs from "node:fs";
import path from "node:path";
import { describe, expect, test } from "vitest";

const root = process.cwd();
const read = (file: string) => fs.readFileSync(path.join(root, file), "utf8");

describe("صفحة تعريف المنصة", () => {
  test("تعرض الفكرة الأساسية ومسار التعلم دون تفاصيل تقنية", () => {
    const about = read("app/about/page.tsx");

    expect(about).toContain("عن المنصة");
    expect(about).toContain("تعلّم الإعراب عبر التفكير التفاعلي لا التلقين");
    expect(about).toContain("كيف وصلتُ إلى هذا الإعراب؟");
    expect(about).toContain("تعلّم");
    expect(about).toContain("تدرّب");
    expect(about).toContain("اختبر نفسك");
    expect(about).not.toMatch(/Supabase|Vercel|SMTP|GitHub/u);
  });

  test("توجد في التنقل الرئيسي كرابط عام مستقل", () => {
    const navbar = read("app/components/Navbar.tsx");

    expect(navbar).toContain('href="/about"');
    expect(navbar).toContain("عن المنصة");
    expect(navbar).toContain('NavIcon name="info"');
  });
});