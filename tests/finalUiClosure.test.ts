import fs from "node:fs";
import path from "node:path";
import { describe, expect, test } from "vitest";

const read = (file: string) =>
  fs.readFileSync(path.join(process.cwd(), file), "utf8");

describe("FINAL_UI_CLOSURE", () => {
  test("الفوتر العام يستخدم يوتيوب وواتساب كأيقونات قابلة للوصول", () => {
    const footer = read("app/components/RouteAwareFooter.tsx");

    expect(footer).toContain("https://www.youtube.com/");
    expect(footer).toContain("https://wa.me/962799127434");
    expect(footer).toContain('aria-label="قناة إعرابُك على YouTube"');
    expect(footer).toContain('aria-label="تواصل عبر WhatsApp على 0799127434"');
    expect(footer).toContain("<YouTubeIcon />");
    expect(footer).toContain("<WhatsAppIcon />");
    expect(footer).not.toContain(">قناة إعرابُك على YouTube</a>");
    expect(footer).not.toContain(">واتساب: 0799127434</a>");
  });

  test("رئيسية الألعاب تستخدم دعوة موحدة للبدء", () => {
    const page = read("app/games/page.tsx");
    expect(page.match(/>ابدأ اللعبة<\/Link>/gu)?.length).toBe(5);
  });

  test("لعبة من معي تبدأ باللعب دون مقدمة مكررة أو مسار تصنيفي طويل", () => {
    const game = read("app/components/WhoIsWithMeGame.tsx");
    const header = game.match(/<header[\s\S]*?<\/header>/u)?.[0] ?? "";

    expect(header).not.toContain("<p>");
    expect(game).not.toContain("المنصوبات ← المرفوعات ← المجرورات ← المبنيات ← المجزومات");
  });

  test("بنية القائمة الحالية تبقى كما هي: شريط جوال وقائمة جانبية", () => {
    const nav = read("app/components/Navbar.tsx");

    expect(nav).toContain('className="app-mobile-bar"');
    expect(nav).toContain("app-mobile-menu-button");
    expect(nav).toContain("<aside");
    expect(nav).toContain("app-sidebar");
  });
});
