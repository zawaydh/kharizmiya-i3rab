import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { getTopicGuide } from "../lib/topicGuides";
import { getTopicMeta } from "../lib/topicCatalog";
import {
  MAFoolKindLabels,
  MAFoolKinds,
  WHICH_MAFOOL_CHALLENGES,
  WHICH_MAFOOL_ROUNDS,
  challengesForMafoolRound,
} from "../content/games/which-mafool";

const read = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");

describe("دليل وألعاب المفاعيل الخمسة", () => {
  it("يعرض المفاعيل كوحدة واحدة ويعرّف الطالب بالأنواع الخمسة عند فتحها", () => {
    const topic = getTopicMeta("mafoolat");
    expect(topic?.name_ar).toBe("المفاعيل");
    expect(topic?.shortLabel).toBe("المفاعيل");
    expect(topic?.subtitle).toContain("المفعول به");
    expect(topic?.subtitle).toContain("المفعول معه");

    const dropdown = read("app/components/TopicDropdown.tsx");
    expect(dropdown).toContain('{ id: "mafoolat", label: "المفاعيل", topicCode: "mafoolat", modes: ["learning", "guide"] }');
    expect(dropdown).not.toContain('label: "المفاعيل الخمسة"');
    expect(dropdown).not.toContain('label: "تمييز المفاعيل الخمسة"');

    const exercisePage = read("app/components/TopicExercisePage.tsx");
    expect(exercisePage).toContain("(المفعول به، المفعول المطلق، المفعول فيه، المفعول لأجله، المفعول معه)");
  });

  it("يبني دليل الخوارزمية على تسلسل مترابط ثم يعود إلى نوع الكلمة والعلامة", () => {
    const guide = getTopicGuide("mafoolat");
    expect(guide).toBeTruthy();
    expect(guide.steps.map((step) => step.title)).toEqual([
      "فحص المفعول معه",
      "فحص المفعول فيه",
      "فحص المفعول المطلق",
      "فحص المفعول لأجله",
      "فحص المفعول به",
      "إذا لم تكن من المفاعيل الخمسة",
      "العودة إلى نوع الكلمة والعلامة",
    ]);
    expect(guide.steps[1]?.question).toContain("استبعدنا المفعول معه");
    expect(guide.steps[2]?.question).toContain("ليست مفعولًا معه ولا مفعولًا فيه");
    expect(guide.steps[3]?.question).toContain("ولا مفعولًا مطلقًا");
    expect(guide.steps[4]?.question).toContain("ولا مفعولًا لأجله");
    expect(guide.steps[6]?.why).toContain("صورة الكلمة");
    for (const step of guide.steps.slice(0, 5)) expect(step.example?.length ?? 0, step.title).toBeGreaterThan(30);
    expect(guide.steps[2]?.why).toContain("قام بعملية");
    expect(guide.start).toContain("المفعول به");
    expect(guide.start).not.toContain("اسم المفعول");
    expect(guide.example.result).toContain("الياء لأنه مثنى");
  });

  it("يغطي في اللعبة الأنواع الخمسة ويعطي لكل اختيار فحصًا خاصًا", () => {
    expect(WHICH_MAFOOL_CHALLENGES.length).toBeGreaterThanOrEqual(10);
    const represented = new Set(WHICH_MAFOOL_CHALLENGES.map((item) => item.correctKind));
    expect([...represented].sort()).toEqual([...MAFoolKinds].sort());

    const gameComponent = read("app/components/WhichMafoolGame.tsx");
    expect(gameComponent).toContain("renderSentenceWithTarget(challenge.sentence, challenge.target)");
    expect(gameComponent).toContain("اقرأ الجملة أولًا");

    for (const challenge of WHICH_MAFOOL_CHALLENGES) {
      expect(challenge.sentence).toContain(challenge.target);
      expect(challenge.finalI3rab).toContain(MAFoolKindLabels[challenge.correctKind]);
      expect(challenge.whyCorrect.length).toBeGreaterThan(45);
      expect(challenge.hint.length).toBeGreaterThan(35);
      for (const kind of MAFoolKinds) {
        expect(challenge.checks[kind].length, `${challenge.id}/${kind}`).toBeGreaterThan(35);
      }
    }
  });

  it("يقسم لعبة أي مفعول إلى ثلاث جولات متدرجة بلا تكرار", () => {
    expect(WHICH_MAFOOL_ROUNDS).toHaveLength(3);
    const ids = WHICH_MAFOOL_ROUNDS.flatMap((round) => round.challengeIds);
    expect(new Set(ids).size).toBe(ids.length);
    for (const round of WHICH_MAFOOL_ROUNDS) {
      expect(challengesForMafoolRound(round)).toHaveLength(5);
    }
    const component = read("app/components/WhichMafoolGame.tsx");
    expect(component).toContain("ثلاث جولات متدرجة");
    expect(component).toContain("GameSuccessPop");
  });

  it("يربط مركز الألعاب ودليل المفاعيل باللعبة الجديدة", () => {
    const games = read("app/games/page.tsx");
    const guidePage = read("app/guide/[topicCode]/page.tsx");
    const gamePage = read("app/games/which-object/page.tsx");

    expect(games).toContain('href="/games/which-object"');
    expect(games).toContain("أيُّ مفعول؟");
    expect(guidePage).toContain('topic.code === "mafoolat"');
    expect(guidePage).toContain('href="/games/which-object"');
    expect(gamePage).toContain("WhichMafoolGame");
  });
});
