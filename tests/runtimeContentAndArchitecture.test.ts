import fs from "node:fs";
import path from "node:path";
import { describe, expect, test } from "vitest";
import { TOPICS } from "../lib/topics";
import { buildRunnerState } from "../lib/exercise/runner";
import { resolveAnswerAttempt, isHintAnswerOption } from "../lib/exercise/answerSession";
import { normalizeThinkingNode } from "../app/components/exercise/ExercisePedagogy";
import type { ExerciseTree, QuestionNode } from "../lib/exercise/model";

const OBSOLETE_NODE_IDS = [
  "pronoun_step_1",
  "manqous_step_1",
  "mubtada_meaning_gate",
  "past_weak_base_taa",
  "past_weak_base_waw",
  "past_alif_weak",
  "R_past_fatha_taa_yaa_visible",
  "R_imperative_delete_noon_attached",
  "tawabi_follow_source",
  "kana_hidden_ism_semantic",
  "kana_khabar_verbal_gate",
  "kana_khabar_single_built",
  "kana_attached_ya_origin",
  "kana_masdar_source_gate",
  "kana_verbal_name",
  "kana_shibh_meaning",
  "inna_sentence_start",
  "inna_base_mubtada",
  "inna_after_nasikh_effect",
  "inna_after_khabar_effect",
  "inna_preposed_shibh_effect",
  "inna_target",
];

type TopicLike = {
  code: string;
  tree: ExerciseTree;
  examples: Array<Record<string, unknown>>;
};

function runtimeWalk(topic: TopicLike, example: Record<string, unknown>) {
  let state: any = buildRunnerState(topic.tree, "learn", example as any);
  const visited: string[] = [];

  for (let step = 0; step < 100; step += 1) {
    const rawNode = topic.tree.nodes[state.currentNodeId] as any;
    expect(rawNode, `${topic.code}: العقدة التشغيلية ${state.currentNodeId} غير موجودة`).toBeTruthy();
    visited.push(String(state.currentNodeId));
    if (rawNode.type === "result") return visited;

    const normalizedNode = normalizeThinkingNode(rawNode, state) as QuestionNode;
    const choiceAnswers = (normalizedNode.answers || []).filter(
      (answer) => !isHintAnswerOption(answer)
    );
    const correctAnswers = choiceAnswers.filter((answer) => {
      const facts = state.facts || {};
      if (!answer.eval) return answer.correct === true;
      const value = facts[answer.eval.fact];
      if (Array.isArray(answer.eval.anyOf)) return answer.eval.anyOf.includes(value);
      if (Object.prototype.hasOwnProperty.call(answer.eval, "notEquals")) {
        return value !== answer.eval.notEquals;
      }
      return value === answer.eval.equals;
    });

    expect(
      correctAnswers,
      `${topic.code}/${String((example as any).id || "example")}/${normalizedNode.id}: إجابة تشغيلية صحيحة واحدة مطلوبة`
    ).toHaveLength(1);

    const activeTree = {
      ...topic.tree,
      nodes: { ...topic.tree.nodes, [state.currentNodeId]: normalizedNode },
    } as ExerciseTree;
    const attempt = resolveAnswerAttempt({
      tree: activeTree,
      node: normalizedNode,
      state,
      answerId: correctAnswers[0].id,
    });
    expect(attempt.kind).toBe("correct");
    if (attempt.kind !== "correct") throw new Error("تعذر الانتقال التشغيلي");
    expect(attempt.blocked).toBe(false);
    expect(
      topic.tree.nodes[attempt.nextNodeId],
      `${topic.code}/${normalizedNode.id}: الهدف التشغيلي ${attempt.nextNodeId} غير موجود`
    ).toBeTruthy();
    state = attempt.nextState;
  }

  throw new Error(`${topic.code}: تجاوز المسار التشغيلي 100 خطوة: ${visited.join(" -> ")}`);
}

describe("سلامة المحتوى التشغيلي والبنية", () => {
  test("كل مثال يصل إلى نتيجة بعد تطبيق تخصيصات العرض الديناميكية", () => {
    for (const topic of TOPICS as TopicLike[]) {
      if (!topic.tree || !Array.isArray(topic.examples)) continue;
      for (const example of topic.examples) {
        const visited = runtimeWalk(topic, example);
        expect(visited.length).toBeGreaterThan(0);
      }
    }
  });

  test("كل عقدة في الشجرة مغطاة بمثال تشغيلي فعلي", () => {
    for (const topic of TOPICS as TopicLike[]) {
      if (!topic.tree || !Array.isArray(topic.examples)) continue;
      const visited = new Set<string>();
      for (const example of topic.examples) {
        runtimeWalk(topic, example).forEach((id) => visited.add(id));
      }
      const uncovered = Object.keys(topic.tree.nodes || {}).filter((id) => !visited.has(id));
      expect(uncovered, `${topic.code}: عقد بلا مثال تشغيلي: ${uncovered.join(", ")}`).toHaveLength(0);
    }
  });

  test("العقد القديمة المحذوفة لا تعود إلى الأشجار أو منطق العرض", () => {
    const allNodeIds = new Set<string>();
    for (const topic of TOPICS as TopicLike[]) {
      Object.keys(topic.tree?.nodes || {}).forEach((id) => allNodeIds.add(id));
    }
    const pedagogyFiles = [
      "app/components/exercise/ExercisePedagogy.ts",
      "app/components/exercise/ExerciseNodePedagogy.ts",
      "app/components/exercise/ExerciseDialoguePedagogy.ts",
      "app/components/exercise/ExercisePracticePedagogy.ts",
      "app/components/exercise/ExerciseSuccessPedagogy.ts",
      "app/components/exercise/KanaPedagogy.ts",
      "app/components/exercise/InnaPedagogy.ts",
      "app/components/exercise/ExerciseStudentHints.ts",
      "app/components/exercise/TawabiStudentHints.ts",
      "app/components/exercise/MafoolStudentHints.ts",
      "app/components/exercise/FaelStudentHints.ts",
      "app/components/exercise/VerbStudentHints.ts",
      "app/components/exercise/NasikhStudentHints.ts",
      "app/components/exercise/NominalStudentHints.ts",
      "app/components/exercise/ExerciseHintShared.ts",
      "app/components/exercise/ExerciseDecisionHelpers.ts",
      "app/components/exercise/ExercisePedagogyTypes.ts",
    ];
    const pedagogySource = pedagogyFiles
      .map((file) => fs.readFileSync(path.join(process.cwd(), file), "utf8"))
      .join("\n");
    for (const id of OBSOLETE_NODE_IDS) {
      expect(allNodeIds.has(id), `العقدة القديمة ${id} ما زالت في الأشجار`).toBe(false);
      expect(pedagogySource.includes(id), `العقدة القديمة ${id} ما زالت في منطق العرض`).toBe(false);
    }
  });

  test("صفحات المراحل تستخدم بوابة موحدة ولا تعيد إعداد المشغّل ثلاث مرات", () => {
    const routeFiles = [
      "app/learn/[topicCode]/page.tsx",
      "app/train/[topicCode]/page.tsx",
      "app/quiz/[topicCode]/page.tsx",
    ];
    for (const routeFile of routeFiles) {
      const source = fs.readFileSync(path.join(process.cwd(), routeFile), "utf8");
      expect(source.includes("TopicExercisePage"), `${routeFile}: لا يستخدم البوابة الموحدة`).toBe(true);
      expect(source.includes("<ExercisePlayer"), `${routeFile}: يعيد إعداد ExercisePlayer`).toBe(false);
      expect(source.includes("getTopicRoutes"), `${routeFile}: يحمل مسارات ميتة`).toBe(false);
    }
    const playerSource = fs.readFileSync(
      path.join(process.cwd(), "app/components/ExercisePlayer.tsx"),
      "utf8"
    );
    expect(playerSource.includes("nav?:")).toBe(false);
  });

  test("مكوّنات المتصفح لا تستورد سجل الموضوعات الثقيل", () => {
    const clientFiles = fs.readdirSync(path.join(process.cwd(), "app"), {
      recursive: true,
      withFileTypes: true,
    }).filter((entry) => entry.isFile() && /\.tsx?$/u.test(entry.name))
      .map((entry) => path.join(entry.parentPath, entry.name))
      .filter((file) => /^\s*["']use client["'];/u.test(fs.readFileSync(file, "utf8")));

    for (const file of clientFiles) {
      const source = fs.readFileSync(file, "utf8");
      expect(
        source,
        `${path.relative(process.cwd(), file)} يحمّل lib/topics.ts إلى المتصفح`,
      ).not.toMatch(/from\s+["'][^"']*\/lib\/topics["']/u);
    }
    expect(clientFiles.length).toBeGreaterThan(0);
  });

  test("الغلاف العام لا يضع حزمة Supabase في التحميل المتزامن", () => {
    const navbar = fs.readFileSync(
      path.join(process.cwd(), "app/components/Navbar.tsx"),
      "utf8",
    );
    const navbarAuth = fs.readFileSync(
      path.join(process.cwd(), "app/components/useDeferredNavbarAuth.ts"),
      "utf8",
    );
    const reporter = fs.readFileSync(
      path.join(process.cwd(), "lib/clientErrorReporting.ts"),
      "utf8",
    );

    expect(navbar).not.toMatch(/^import .*supabaseClient/mu);
    expect(navbar).not.toContain('from "./useAuthUser"');
    expect(navbarAuth).toContain('await import("../../lib/supabaseClient")');
    expect(reporter).toContain('await import("./supabaseClient")');
  });

  test("لا تعود الملفات الميتة التي حُذفت أثناء التنظيف", () => {
    expect(fs.existsSync(path.join(process.cwd(), "lib/shuffle.ts"))).toBe(false);
    expect(fs.existsSync(path.join(process.cwd(), "lib/topics.js"))).toBe(false);
    expect(fs.existsSync(path.join(process.cwd(), "lib/topicGuides.js"))).toBe(false);
    expect(fs.existsSync(path.join(process.cwd(), "lib/topics.ts"))).toBe(true);
    expect(fs.existsSync(path.join(process.cwd(), "lib/topicGuides.ts"))).toBe(true);
    for (const legacyFile of ["db.js", "db.d.ts", "authHelpers.js", "supabaseClient.js"]) {
      expect(fs.existsSync(path.join(process.cwd(), "lib", legacyFile))).toBe(false);
    }
    for (const typedFile of ["db.ts", "authHelpers.ts", "supabaseClient.ts"]) {
      expect(fs.existsSync(path.join(process.cwd(), "lib", typedFile))).toBe(true);
      expect(fs.readFileSync(path.join(process.cwd(), "lib", typedFile), "utf8")).not.toMatch(/\bany\b/);
    }
    for (const legacyFile of ["useAuthUser.js", "StageAccessGate.jsx", "AuthLockGate.jsx"]) {
      expect(fs.existsSync(path.join(process.cwd(), "app/components", legacyFile))).toBe(false);
    }
    for (const typedFile of ["useAuthUser.ts", "StageAccessGate.tsx", "AuthLockGate.tsx"]) {
      const typedPath = path.join(process.cwd(), "app/components", typedFile);
      expect(fs.existsSync(typedPath)).toBe(true);
      expect(fs.readFileSync(typedPath, "utf8")).not.toMatch(/\bany\b/);
    }
  });

  test("ExercisePlayer يبقى مكوّن تنسيق لا ملفًا أحاديًا متضخمًا", () => {
    const playerPath = path.join(process.cwd(), "app/components/ExercisePlayer.tsx");
    const pedagogyPath = path.join(
      process.cwd(),
      "app/components/exercise/ExercisePedagogy.ts"
    );
    const extractedPedagogyPaths = [
      "ExerciseNodePedagogy.ts",
      "ExerciseDialoguePedagogy.ts",
      "ExerciseDialogueBridge.ts",
      "ExerciseDialogueUtils.ts",
      "ExerciseOpeningDialogue.ts",
      "ExtendedTopicOpeningDialogue.ts",
      "ExercisePracticePedagogy.ts",
      "ExerciseSuccessPedagogy.ts",
      "KanaFinalIntro.ts",
      "KanaPedagogyLanguage.ts",
      "KanaQuestionPedagogy.ts",
      "KanaResultPedagogy.ts",
    ].map((file) => path.join(process.cwd(), "app/components/exercise", file));
    const questionStagePath = path.join(
      process.cwd(),
      "app/components/exercise/ExerciseQuestionStage.tsx"
    );
    const stagePresentationPath = path.join(
      process.cwd(),
      "app/components/exercise/ExerciseStagePresentation.ts"
    );
    const kanaPedagogyPath = path.join(
      process.cwd(),
      "app/components/exercise/KanaPedagogy.ts"
    );
    const questionViewPaths = [
      "ExerciseChoiceAnswers.tsx",
      "ExercisePracticeQuestion.tsx",
      "ExerciseQuestionStageTypes.ts",
    ].map((file) => path.join(process.cwd(), "app/components/exercise", file));
    const innaPedagogyPath = path.join(
      process.cwd(),
      "app/components/exercise/InnaPedagogy.ts"
    );
    const studentHintsPath = path.join(
      process.cwd(),
      "app/components/exercise/ExerciseStudentHints.ts"
    );
    const topicHintPaths = [
      "TawabiStudentHints.ts",
      "MafoolStudentHints.ts",
      "FaelStudentHints.ts",
      "VerbStudentHints.ts",
      "NasikhStudentHints.ts",
      "NominalStudentHints.ts",
      "MafoolatStudentHints.ts",
      "ExtendedTopicStudentHints.ts",
      "ExerciseHintShared.ts",
    ].map((file) => path.join(process.cwd(), "app/components/exercise", file));
    const decisionHelpersPath = path.join(
      process.cwd(),
      "app/components/exercise/ExerciseDecisionHelpers.ts"
    );
    const pedagogyTypesPath = path.join(
      process.cwd(),
      "app/components/exercise/ExercisePedagogyTypes.ts"
    );
    const questionMotionPath = path.join(
      process.cwd(),
      "app/components/exercise/useQuestionMotion.ts"
    );
    const practiceFlowPath = path.join(
      process.cwd(),
      "app/components/exercise/ExercisePracticeFlow.ts"
    );
    const uiStatePath = path.join(
      process.cwd(),
      "app/components/exercise/useExerciseUiState.ts"
    );
    const practiceSessionPath = path.join(
      process.cwd(),
      "app/components/exercise/useExercisePracticeFlow.ts"
    );
    const navigationActionsPath = path.join(
      process.cwd(),
      "app/components/exercise/ExerciseNavigationActions.ts"
    );
    const questionActionsPath = path.join(
      process.cwd(),
      "app/components/exercise/ExerciseQuestionActions.ts"
    );
    const resultStagePath = path.join(
      process.cwd(),
      "app/components/exercise/ExerciseResultStage.tsx"
    );
    const quizStagePath = path.join(
      process.cwd(),
      "app/components/exercise/ExerciseQuizStage.tsx"
    );
    const playerLines = fs.readFileSync(playerPath, "utf8").split(/\r?\n/).length;
    const pedagogyLines = fs.readFileSync(pedagogyPath, "utf8").split(/\r?\n/).length;
    const extractedPedagogyLineCounts = extractedPedagogyPaths.map((file) =>
      fs.readFileSync(file, "utf8").split(/\r?\n/).length
    );
    const questionStageLines = fs.readFileSync(questionStagePath, "utf8").split(/\r?\n/).length;
    const kanaLines = fs.readFileSync(kanaPedagogyPath, "utf8").split(/\r?\n/).length;
    const innaLines = fs.readFileSync(innaPedagogyPath, "utf8").split(/\r?\n/).length;
    const studentHintLines = fs.readFileSync(studentHintsPath, "utf8").split(/\r?\n/).length;
    const topicHintLineCounts = topicHintPaths.map((file) =>
      fs.readFileSync(file, "utf8").split(/\r?\n/).length
    );
    expect(playerLines).toBeLessThan(500);
    expect(pedagogyLines).toBeLessThan(80);
    expect(Math.max(...extractedPedagogyLineCounts)).toBeLessThan(450);
    expect(questionStageLines).toBeLessThan(260);
    expect(kanaLines).toBeLessThan(50);
    expect(innaLines).toBeLessThan(180);
    expect(studentHintLines).toBeLessThan(100);
    expect(Math.max(...topicHintLineCounts)).toBeLessThan(350);
    expect(fs.existsSync(stagePresentationPath)).toBe(true);
    expect(fs.existsSync(decisionHelpersPath)).toBe(true);
    expect(fs.existsSync(pedagogyTypesPath)).toBe(true);
    expect(fs.existsSync(questionMotionPath)).toBe(true);
    expect(fs.existsSync(practiceFlowPath)).toBe(true);
    expect(fs.existsSync(uiStatePath)).toBe(true);
    expect(fs.existsSync(practiceSessionPath)).toBe(true);
    expect(fs.existsSync(navigationActionsPath)).toBe(true);
    expect(fs.existsSync(questionActionsPath)).toBe(true);
    expect(fs.existsSync(resultStagePath)).toBe(true);
    expect(fs.existsSync(quizStagePath)).toBe(true);
    const strictlyTypedPedagogyFiles = [
      playerPath,
      pedagogyPath,
      ...extractedPedagogyPaths,
      questionStagePath,
      ...questionViewPaths,
      kanaPedagogyPath,
      innaPedagogyPath,
      studentHintsPath,
      ...topicHintPaths,
      decisionHelpersPath,
      questionMotionPath,
      practiceFlowPath,
      uiStatePath,
      practiceSessionPath,
      navigationActionsPath,
      questionActionsPath,
      resultStagePath,
    ];
    for (const file of strictlyTypedPedagogyFiles) {
      expect(fs.readFileSync(file, "utf8"), `${path.basename(file)} يعيد any الصريح`).not.toMatch(/\bany\b/);
    }
    const pedagogyEntry = fs.readFileSync(pedagogyPath, "utf8");
    expect(pedagogyEntry).toContain("./ExerciseStagePresentation");
    expect(pedagogyEntry).toContain("./KanaPedagogy");
    expect(pedagogyEntry).toContain("./InnaPedagogy");
    expect(pedagogyEntry).toContain("./ExerciseStudentHints");
    expect(pedagogyEntry).toContain("./ExerciseDecisionHelpers");

    const studentHintsEntry = fs.readFileSync(studentHintsPath, "utf8");
    for (const moduleName of [
      "TawabiStudentHints",
      "MafoolStudentHints",
      "FaelStudentHints",
      "VerbStudentHints",
      "NasikhStudentHints",
      "NominalStudentHints",
    ]) {
      expect(studentHintsEntry).toContain(`./${moduleName}`);
    }

    const playerSource = fs.readFileSync(playerPath, "utf8");
    const questionStageSource = fs.readFileSync(questionStagePath, "utf8");
    const motionSource = fs.readFileSync(questionMotionPath, "utf8");
    const uiStateSource = fs.readFileSync(uiStatePath, "utf8");
    const resultStageSource = fs.readFileSync(resultStagePath, "utf8");
    expect(playerSource).toContain('from "./exercise/ExerciseResultStage"');
    expect(playerSource).not.toContain("practiceCorrectionMode");
    expect(playerSource).not.toContain("stepReview");
    expect(playerSource).not.toContain("microCelebrate");
    expect(uiStateSource.match(/correctAdvanceTimerRef\.current = window\.setTimeout/g) || []).toHaveLength(1);
    expect(questionStageSource).toContain('disabled={cardPhase !== "idle"}');
    expect(motionSource).not.toContain("practiceCorrectionMode");
    expect(motionSource).not.toContain("stepReview");
    expect(resultStageSource).toContain("تثبيت سريع بعد الإعراب");
    expect(resultStageSource).toContain("final-i3rab-line");
  });
});
