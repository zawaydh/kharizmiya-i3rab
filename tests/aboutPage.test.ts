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
    expect(about).toContain("التدريب");
    expect(about).toContain("الاختبار النهائي");
    expect(about).not.toMatch(/Supabase|Vercel|SMTP|GitHub/u);
  });

  test("يحافظ على السؤال الأساسي ظاهرًا على شاشة الهاتف", () => {
    const about = read("app/about/page.tsx");
    const responsive = read("app/styles/81-clean-responsive.css");

    expect(about).toContain('className="home-entry-lead about-thinking-question"');
    expect(responsive).toMatch(/\.home-entry-lead\s*\{\s*display:\s*none;\s*\}/u);
    expect(responsive).toMatch(
      /\.about-thinking-question\s*\{[^}]*display:\s*block;[^}]*\}/su,
    );
  });
  test("توجد في التنقل الرئيسي كرابط عام مستقل", () => {
    const navbar = read("app/components/Navbar.tsx");

    expect(navbar).toContain('href="/about"');
    expect(navbar).toContain("عن المنصة");
    expect(navbar).toContain('NavIcon name="info"');
  });
});