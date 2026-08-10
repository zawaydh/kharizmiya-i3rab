import { describe, expect, it } from "vitest";
import { getReadyTopics, getTopicRoutes } from "../lib/topics";
import { getTopicGuide, TOPIC_GUIDES } from "../lib/topicGuides";
import fs from "node:fs";
import path from "node:path";

const read = (relativePath: string) => fs.readFileSync(path.join(process.cwd(), relativePath), "utf8");

describe("algorithm guide integration", () => {
  it("provides a complete guide for every ready topic", () => {
    const topics = getReadyTopics();
    expect(Object.keys(TOPIC_GUIDES)).toHaveLength(topics.length);

    for (const topic of topics) {
      const guide = getTopicGuide(topic.code);
      expect(guide, topic.code).toBeTruthy();
      expect(guide.goal.length).toBeGreaterThan(20);
      expect(guide.start.length).toBeGreaterThan(10);
      expect(guide.steps.length).toBeGreaterThanOrEqual(4);
      expect(guide.example.walkthrough.length).toBeGreaterThanOrEqual(3);
      expect(guide.commonMistakes.length).toBeGreaterThanOrEqual(3);
      expect(getTopicRoutes(topic.code).guide).toBe(`/guide/${topic.code}`);
    }
  });

  it("renames the topics navigation and adds the guide branch", () => {
    const navbar = read("app/components/Navbar.tsx");
    const dropdown = read("app/components/TopicDropdown.tsx");

    expect(navbar).toContain('buttonLabel="مدرّب التفكير"');
    expect(navbar).toContain('buttonLabel="تعليمات قبل التدريب"');
    expect(navbar).toContain('mode="guide"');
    expect(dropdown).toContain('mode === "guide"');
    expect(dropdown).toContain("routes.guide");
  });

  it("keeps every guide explanation card full-width on narrow phones", () => {
    const css = read("app/styles/91-algorithm-guide-responsive.css");
    expect(css).toContain("MOBILE GUIDE — give every explanation card the full phone width");
    expect(css).toContain("@media (max-width: 520px)");
    expect(css).toMatch(/\.algorithm-step-card\s*\{\s*position:\s*relative;\s*display:\s*block;/);
    expect(css).toMatch(/\.algorithm-step-rail\s*\{\s*position:\s*absolute;/);
    expect(css).toMatch(/\.algorithm-step-line\s*\{\s*display:\s*none;/);
    expect(css).toContain("grid-template-columns: minmax(0, 1fr)");
  });

  it("creates guide index and topic pages", () => {
    const layout = read("app/guide/layout.tsx");
    expect(layout).toContain('90-algorithm-guide.css');
    expect(layout).toContain('91-algorithm-guide-responsive.css');
    expect(read("app/guide/page.tsx")).toContain("تعليمات قبل التدريب");
    const topicPage = read("app/guide/[topicCode]/page.tsx");
    expect(topicPage).toContain("ملخص القاعدة");
    expect(topicPage).toContain("خطوات التفكير");
    expect(topicPage).toContain("اسأل نفسك");
    expect(topicPage).toContain("بناءً على إجابتك");
    expect(topicPage).not.toContain("لماذا هذه الخطوة؟");
    expect(topicPage).toContain("ابدأ مدرّب التفكير");
  });


  it("explains the present-verb branches without mixing building and inflection", () => {
    const present = getTopicGuide("present-verb");
    expect(present.goal).toContain("نون النسوة فيبنى على السكون");
    expect(present.goal).toContain("نون التوكيد فيبنى على الفتح");
    expect(present.goal).toContain("فإن لم يسبقه ناصب أو جازم كان مرفوعًا");
    expect(present.goal).toContain("وإن سبقه ناصب كان منصوبًا");
    expect(present.goal).toContain("وإن سبقه جازم كان مجزومًا");
    expect(present.goal).toContain("ويبقى للعامل السابق أثر في محل المضارع المبني");

    expect(present.steps[0].title).toBe("هل الفعل معرب أم مبني؟");
    expect(present.steps[0].branches.map((branch) => branch.label)).toEqual([
      "نون النسوة",
      "نون التوكيد",
      "المحل الإعرابي",
    ]);
    expect(present.steps[0].branches[2].text).toContain("في محل رفع");
    expect(present.steps[0].branches[2].text).toContain("في محل نصب");
    expect(present.steps[0].branches[2].text).toContain("في محل جزم");

    expect(present.steps[1].title).toBe("تحديد الحالة الإعرابية");
    expect(present.steps[1].branches.map((branch) => branch.label)).toEqual([
      "لا ناصب ولا جازم",
      "سبقه ناصب",
      "سبقه جازم",
    ]);

    expect(present.steps[2].branches).toHaveLength(3);
    expect(present.steps[2].branches.map((branch) => branch.label)).toEqual([
      "صحيح الآخر",
      "معتل الآخر",
      "الأفعال الخمسة",
    ]);
    expect(present.example.result).toContain("في محل نصب");

    const topicPage = read("app/guide/[topicCode]/page.tsx");
    expect(topicPage).toContain("algorithm-step-branches");
  });
});
