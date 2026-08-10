import { describe, expect, it } from "vitest";
import { readCleanSystemCss } from "./cssTestUtils";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(process.cwd());
const read = (relativePath: string) => readFileSync(resolve(root, relativePath), "utf8");

describe("home, navigation, and mobile glossary corrections", () => {
  it("places the algorithm guide before the thinking trainer in the navigation", () => {
    const navbar = read("app/components/Navbar.tsx");
    const guideIndex = navbar.indexOf('buttonLabel="تعليمات قبل التدريب"');
    const trainerIndex = navbar.indexOf('buttonLabel="مدرّب التفكير"');
    expect(guideIndex).toBeGreaterThan(-1);
    expect(trainerIndex).toBeGreaterThan(-1);
    expect(guideIndex).toBeLessThan(trainerIndex);
  });


  it("keeps the algorithm guide readable before sign-in", () => {
    const guideIndex = read("app/guide/page.tsx");
    const guideTopic = read("app/guide/[topicCode]/page.tsx");
    const navbar = read("app/components/Navbar.tsx");

    expect(guideIndex).not.toContain("AuthLockGate");
    expect(guideTopic).not.toContain("AuthLockGate");
    expect(navbar).toContain('buttonLabel="تعليمات قبل التدريب"');
    expect(navbar).toContain('locked={false}');
  });

  it("briefly defines both learning tools on the home page with the guide first", () => {
    const home = read("app/page.tsx");
    const guideIndex = home.indexOf('className="home-tool-card home-tool-guide"');
    const trainerIndex = home.indexOf('className="home-tool-card home-tool-trainer"');
    expect(home).toContain("يلخّص القاعدة، ويشرح لماذا نسأل كل سؤال");
    expect(home).toContain("يحوّل القاعدة إلى أسئلة تفاعلية");
    expect(home).toContain('href="/guide"');
    expect(home).toContain('href="/topics"');
    expect(guideIndex).toBeGreaterThan(-1);
    expect(trainerIndex).toBeGreaterThan(-1);
    expect(guideIndex).toBeLessThan(trainerIndex);
  });


  it("uses the guide and thinking trainer as the two main home actions", () => {
    const home = read("app/page.tsx");
    const navbar = read("app/components/Navbar.tsx");

    expect(home).toContain('href="/guide"');
    expect(home).toContain("اقرأ تعليمات قبل التدريب");
    expect(home).toContain('href="/topics"');
    expect(home).toContain("ادخل إلى مدرّب التفكير");
    expect(home).not.toContain('href="/i3rab-in-our-speech"');
    expect(navbar).toContain('href="/games"');
  });

  it("keeps the topic map focused and moves transversal grammar help into context", () => {
    const dropdown = read("app/components/TopicDropdown.tsx");
    const textViews = read("app/components/exercise/ExerciseTextViews.tsx");
    const sharedViews = read("app/components/exercise/ExerciseSharedViews.tsx");

    for (const topic of ["لا النافية للجنس", "نائب الفاعل", "المفاعيل", "الحال", "التمييز", "الاستثناء", "المنادى", "الاسم المنقوص"]) {
      expect(dropdown).toContain(topic);
    }

    expect(dropdown).not.toContain('label: "الأسماء المبنية"');
    expect(dropdown).not.toContain('id: "majrurat"');
    expect(sharedViews).toContain('"حروف الجر"');
    expect(sharedViews).toContain('"المضاف إليه"');
    expect(textViews).toContain('aria-label={`شرح ${helpTerm}`}');
    expect(textViews).toContain('className="smart-term sentence-smart-term"');
    expect(textViews).toContain('title={`مرّر أو انقر لشرح ${helpTerm}`}');
    expect(textViews).not.toContain('>؟</button>');
  });

  it("uses the branching-node icon for visual paths", () => {
    const dropdown = read("app/components/TopicDropdown.tsx");
    expect(dropdown).toContain('<circle cx="7" cy="4" r="2" />');
    expect(dropdown).toContain('<circle cx="17" cy="9" r="2" />');
    expect(dropdown).toContain('<circle cx="7" cy="20" r="2" />');
    expect(dropdown).toContain('M7 6v12M7 14h7.2');
  });

  it("centers the glossary card inside the phone viewport", () => {
    const css = readCleanSystemCss();
    expect(css).toContain("MOBILE GLOSSARY — keep the definition inside the visible phone viewport");
    expect(css).toContain("left: 50%");
    expect(css).toContain("transform: translateX(-50%)");
    expect(css).toContain("width: min(360px, calc(100vw - 20px))");
  });
});
