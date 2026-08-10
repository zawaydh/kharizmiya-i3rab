import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { getReadyTopicMetadata, getTopicMeta } from "../lib/topicCatalog";
import { ismManqousTree } from "../content/trees/ism_manqous";
import type { QuestionNode } from "../lib/exercise/model";

const read = (file: string) => readFileSync(resolve(process.cwd(), file), "utf8");

describe("contextual grammar help and consolidated topics", () => {
  it("removes standalone built-noun and genitive branches from navigation", () => {
    const dropdown = read("app/components/TopicDropdown.tsx");
    expect(dropdown).not.toContain('label: "الأسماء المبنية"');
    expect(dropdown).not.toContain('id: "majrurat"');
    expect(dropdown).toContain('{ id: "mafoolat", label: "المفاعيل", topicCode: "mafoolat", modes: ["learning", "guide"] }');
    expect(dropdown).not.toContain('disabled: true');
    expect(dropdown).not.toContain('قريبًا');
  });

  it("keeps internal reusable topics out of the student catalog", () => {
    expect(getTopicMeta("attached-pronouns")?.isReady).toBe(true);
    expect(getTopicMeta("attached-pronouns")?.isListed).toBe(false);
    expect(getTopicMeta("mafool-bih")?.isListed).toBe(false);
    const listed = getReadyTopicMetadata().map((topic) => topic.code);
    expect(listed).not.toContain("attached-pronouns");
    expect(listed).not.toContain("mafool-bih");
    expect(listed).toContain("mafoolat");
  });

  it("makes built nouns, prepositions, and addition help clickable in guided sentences", () => {
    const textViews = read("app/components/exercise/ExerciseTextViews.tsx");
    const shared = read("app/components/exercise/ExerciseSharedViews.tsx");
    expect(textViews).toContain('return "حروف الجر"');
    expect(textViews).toContain('return "المضاف إليه"');
    expect(textViews).toContain('return "اسم إشارة"');
    expect(textViews).toContain('return "ضمير منفصل"');
    expect(shared).toContain("الممنوع من الصرف يجر بالفتحة");
    expect(shared).toContain("وجود «الـ» في الكلمة الثانية وحده لا يكفي");
    expect(shared).toContain("مفردة، مكبرة، مضافة، ومضافة إلى غير ياء المتكلم");
    expect(shared).toContain("في «فو» أن تكون بلا ميم");
    expect(textViews).toContain('["من", "إلى", "عن", "على", "في", "ب", "ك", "ل"');
    expect(textViews).toContain('className="smart-term sentence-smart-term"');
    expect(textViews).not.toContain('>؟</button>');
    expect(textViews).toContain("onMouseEnter={() => setShowQuestion(true)}");
    expect(textViews).toContain('display: showQuestion ? "grid" : "none"');
    expect(textViews).toContain("؟");
  });

  it("orders the defective-noun algorithm as al then addition then case", () => {
    expect(ismManqousTree.startNodeId).toBe("manqous_identity");
    const al = ismManqousTree.nodes.manqous_has_al as QuestionNode;
    const added = ismManqousTree.nodes.manqous_is_added as QuestionNode;
    expect(al.answers.find((answer) => answer.id === "no")?.next).toBe("manqous_is_added");
    expect(added.answers.find((answer) => answer.id === "no")?.next).toBe("manqous_indef_case");
  });

  it("renames the guide for students", () => {
    const navbar = read("app/components/Navbar.tsx");
    const guide = read("app/guide/page.tsx");
    expect(navbar).toContain('buttonLabel="تعليمات قبل التدريب"');
    expect(guide).toContain("تعليمات قبل التدريب");
    expect(navbar).not.toContain('buttonLabel="دليل الخوارزمية"');
  });
});
