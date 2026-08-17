import { describe, expect, it } from "vitest";
import { existsSync, readFileSync, statSync } from "node:fs";
import { resolve } from "node:path";
import postcss from "postcss";
import type { AtRule, Node } from "postcss";

const root = resolve(process.cwd());
const globalsPath = resolve(root, "app/globals.css");
const expectedModules = [
  "00-foundation.css",
  "10-shell-auth-exercise.css",
  "20-navigation-paths.css",
  "30-start-learning-core.css",
  "31-start-page-flow.css",
  "40-learning-flow.css",
  "50-exercise-workspace.css",
  "60-exercise-stability.css",
  "61-exercise-feedback.css",
  "70-exercise-flow.css",
  "71-quiz-remedial.css",
  "72-text-game.css",
  "73-paths-dashboard.css",
  "74-speech-game.css",
  "79-navigation-system.css",
  "80-clean-system.css",
  "80-page-system.css",
  "81-clean-responsive.css",
  "82-learning-stability.css",
  "83-home-glossary.css",
];

const moduleLayers = new Map<string, string>([
  ["00-foundation.css", "foundation"],
  ["10-shell-auth-exercise.css", "shell-auth-exercise"],
  ["20-navigation-paths.css", "navigation-paths"],
  ["30-start-learning-core.css", "start-learning-core"],
  ["31-start-page-flow.css", "start-learning-core"],
  ["40-learning-flow.css", "learning-flow"],
  ["50-exercise-workspace.css", "exercise-workspace"],
  ["60-exercise-stability.css", "exercise-stability"],
  ["61-exercise-feedback.css", "exercise-stability"],
  ["70-exercise-flow.css", "pages-games-dashboard"],
  ["71-quiz-remedial.css", "pages-games-dashboard"],
  ["72-text-game.css", "pages-games-dashboard"],
  ["73-paths-dashboard.css", "pages-games-dashboard"],
  ["74-speech-game.css", "pages-games-dashboard"],
  ["79-navigation-system.css", "navigation-system"],
  ["80-clean-system.css", "clean-system"],
  ["80-page-system.css", "page-system"],
  ["81-clean-responsive.css", "clean-responsive"],
  ["82-learning-stability.css", "learning-stability"],
  ["83-home-glossary.css", "home-glossary"],
]);

const expectedLayers = [
  "foundation",
  "shell-auth-exercise",
  "navigation-paths",
  "start-learning-core",
  "learning-flow",
  "exercise-workspace",
  "exercise-stability",
  "pages-games-dashboard",
  "navigation-system",
  "clean-system",
  "page-system",
  "clean-responsive",
  "learning-stability",
  "home-glossary",
];

const globalModules = [
  "00-foundation.css",
  "10-shell-auth-exercise.css",
  "20-navigation-paths.css",
  "79-navigation-system.css",
  "80-clean-system.css",
  "80-page-system.css",
  "81-clean-responsive.css",
  "82-learning-stability.css",
];

const guideModules = [
  "90-algorithm-guide.css",
  "91-algorithm-guide-responsive.css",
];
const allModules = [...expectedModules, ...guideModules];

describe("CSS architecture", () => {
  it("keeps globals.css as a small ordered import manifest", () => {
    const globals = readFileSync(globalsPath, "utf8");
    expect(Buffer.byteLength(globals, "utf8")).toBeLessThan(1200);

    const imports = [...globals.matchAll(/@import\s+"\.\/styles\/([^"]+)";/g)].map(
      (match) => match[1],
    );
    expect(imports).toEqual(globalModules);
    expect(globals).not.toContain("@layer ");
    const foundation = readFileSync(resolve(root, "app/styles/00-foundation.css"), "utf8");
    expect(foundation).toContain(
      `@layer ${[...expectedLayers, "algorithm-guide"].join(", ")};`,
    );
  });

  it("loads activity and page CSS only on routes that use it", () => {
    const sharedExerciseModules = [
      "30-start-learning-core.css",
      "40-learning-flow.css",
      "50-exercise-workspace.css",
      "60-exercise-stability.css",
      "61-exercise-feedback.css",
      "70-exercise-flow.css",
      "83-home-glossary.css",
    ];
    for (const routeFile of [
      "app/learn/[topicCode]/page.tsx",
      "app/train/[topicCode]/page.tsx",
      "app/quiz/[topicCode]/page.tsx",
    ]) {
      const source = readFileSync(resolve(root, routeFile), "utf8");
      for (const moduleName of sharedExerciseModules) expect(source).toContain(moduleName);
    }
    expect(readFileSync(resolve(root, "app/quiz/[topicCode]/page.tsx"), "utf8"))
      .toContain("71-quiz-remedial.css");
    for (const routeFile of [
      "app/learn/[topicCode]/page.tsx",
      "app/train/[topicCode]/page.tsx",
    ]) {
      expect(readFileSync(resolve(root, routeFile), "utf8"))
        .not.toContain("71-quiz-remedial.css");
    }

    const pageStyleRoutes = new Map([
      ["app/page.tsx", "83-home-glossary.css"],
      ["app/texts/[topicCode]/page.tsx", "72-text-game.css"],
      ["app/dashboard/layout.tsx", "73-paths-dashboard.css"],
      ["app/i3rab-in-our-speech/page.tsx", "74-speech-game.css"],
      ["app/games/page.tsx", "74-speech-game.css"],
      ["app/games/where-is-my-place/page.tsx", "74-speech-game.css"],
      ["app/games/which-object/page.tsx", "74-speech-game.css"],
      ["app/games/who-is-with-me/page.tsx", "74-speech-game.css"],
      ["app/games/markati/page.tsx", "74-speech-game.css"],
      ["app/paths/layout.tsx", "73-paths-dashboard.css"],
    ]);
    for (const [routeFile, moduleName] of pageStyleRoutes) {
      expect(readFileSync(resolve(root, routeFile), "utf8")).toContain(moduleName);
    }

    const startSource = readFileSync(resolve(root, "app/learn/start/page.tsx"), "utf8");
    expect(startSource).toContain("30-start-learning-core.css");
    expect(startSource).toContain("31-start-page-flow.css");
    for (const routeFile of [
      "app/learn/[topicCode]/page.tsx",
      "app/train/[topicCode]/page.tsx",
      "app/quiz/[topicCode]/page.tsx",
    ]) {
      expect(readFileSync(resolve(root, routeFile), "utf8"))
        .not.toContain("31-start-page-flow.css");
    }

    const globals = readFileSync(globalsPath, "utf8");
    for (const moduleName of sharedExerciseModules) expect(globals).not.toContain(moduleName);
    expect(existsSync(resolve(root, "app/styles/70-pages-games-dashboard.css"))).toBe(false);
  });

  it("keeps each CSS module inside its ordered cascade layer", () => {
    expectedModules.forEach((moduleName) => {
      const css = readFileSync(resolve(root, "app/styles", moduleName), "utf8").trim();
      if (moduleName === "00-foundation.css") {
        expect(css).toContain("\n\n@layer foundation {");
      } else {
        expect(css.startsWith(`@layer ${moduleLayers.get(moduleName)} {`)).toBe(true);
      }
      expect(css.endsWith("}")).toBe(true);
    });
    for (const moduleName of guideModules) {
      const css = readFileSync(resolve(root, "app/styles", moduleName), "utf8").trim();
      expect(css.startsWith("@layer algorithm-guide {")).toBe(true);
      expect(css.endsWith("}")).toBe(true);
    }
  });

  it("keeps every imported CSS module present and non-empty", () => {
    for (const moduleName of allModules) {
      const modulePath = resolve(root, "app/styles", moduleName);
      expect(statSync(modulePath).size).toBeGreaterThan(100);
    }
  });

  it("keeps active CSS and each semantic module below the maintenance limits", () => {
    const moduleLineCounts = expectedModules.map((moduleName) =>
      readFileSync(resolve(root, "app/styles", moduleName), "utf8").split(/\r?\n/).length,
    );
    const visualPathLines = readFileSync(
      resolve(root, "app/paths/visual-paths.css"),
      "utf8",
    ).split(/\r?\n/).length;

    const guideLineCounts = guideModules.map((moduleName) =>
      readFileSync(resolve(root, "app/styles", moduleName), "utf8").split(/\r?\n/).length,
    );

    expect(Math.max(...moduleLineCounts, ...guideLineCounts)).toBeLessThan(700);
    expect(moduleLineCounts.reduce((sum, lines) => sum + lines, 0)).toBeLessThan(5100);
    expect(moduleLineCounts.reduce((sum, lines) => sum + lines, visualPathLines)).toBeLessThan(5700);
    expect(guideLineCounts.reduce((sum, lines) => sum + lines, 0)).toBeLessThan(825);

    const declarationCounts = expectedModules.map((moduleName) => {
      const parsed = postcss.parse(readFileSync(resolve(root, "app/styles", moduleName), "utf8"));
      let count = 0;
      parsed.walkDecls(() => { count += 1; });
      return count;
    });
    expect(Math.max(...declarationCounts)).toBeLessThan(700);
    expect(declarationCounts.reduce((sum, count) => sum + count, 0)).toBeLessThan(5000);
  });

  it("uses exactly one active final visual system", () => {
    const globals = readFileSync(globalsPath, "utf8");
    expect(globals).toContain('80-clean-system.css');
    expect(globals).toContain('81-clean-responsive.css');
    expect(globals).toContain('82-learning-stability.css');
    expect(globals).not.toContain('83-home-glossary.css');
    expect(readFileSync(resolve(root, "app/page.tsx"), "utf8"))
      .toContain('83-home-glossary.css');
    expect(globals).not.toContain('90-algorithm-guide.css');
    expect(readFileSync(resolve(root, "app/guide/layout.tsx"), "utf8"))
      .toContain('91-algorithm-guide-responsive.css');
    expect(globals).not.toContain('95-classic-readable.css');
    expect(globals).not.toContain('96-contrast-menu-path-fixes.css');
    expect(globals).not.toContain('97-unified-workspaces.css');
    expect(globals).not.toContain('98-stable-activity-system.css');
  });
  it("keeps one navigation implementation without legacy duplicates", () => {
    const navbar = readFileSync(resolve(root, "app/components/Navbar.tsx"), "utf8");
    const topicDropdown = readFileSync(resolve(root, "app/components/TopicDropdown.tsx"), "utf8");
    const styleContents = expectedModules.map((moduleName) => ({
      moduleName,
      css: readFileSync(resolve(root, "app/styles", moduleName), "utf8"),
    }));

    expect(navbar.match(/<aside\s/g)?.length ?? 0).toBe(1);
    expect(navbar).toContain("app-sidebar");
    expect(navbar).not.toContain("platform-navbar");
    expect(topicDropdown).not.toContain("DesktopPanel");
    expect(topicDropdown).not.toContain("TreeItem");

    const sidebarModules = styleContents
      .filter(({ css }) => css.includes(".app-sidebar"))
      .map(({ moduleName }) => moduleName);
    expect(sidebarModules).toEqual([
      "79-navigation-system.css",
      "81-clean-responsive.css",
    ]);

    for (const { css } of styleContents) {
      expect(css).not.toContain(".platform-navbar");
      expect(css).not.toContain("--platform-nav-height");
    }
  });

  it("keeps legacy page modules free of important overrides", () => {
    const legacyModules = [
      "30-start-learning-core.css",
      "31-start-page-flow.css",
      "40-learning-flow.css",
      "50-exercise-workspace.css",
      "60-exercise-stability.css",
      "61-exercise-feedback.css",
      "70-exercise-flow.css",
      "71-quiz-remedial.css",
      "72-text-game.css",
      "73-paths-dashboard.css",
      "74-speech-game.css",
    ];
    for (const moduleName of legacyModules) {
      const css = readFileSync(resolve(root, "app/styles", moduleName), "utf8");
      expect(css).not.toContain("!important");
    }
  });

  it("reserves important overrides for accessibility and print rules", () => {
    let totalImportant = 0;
    let accessibilityAndPrintImportant = 0;
    for (const moduleName of allModules) {
      const css = readFileSync(resolve(root, "app/styles", moduleName), "utf8");
      const parsed = postcss.parse(css);
      parsed.walkDecls((declaration) => {
        if (declaration.important) totalImportant += 1;
      });
      parsed.walkAtRules("media", (atRule) => {
        if (!/(?:^|\W)(?:print|prefers-reduced-motion)(?:\W|$)/.test(atRule.params)) return;
        atRule.walkDecls((declaration) => {
          if (declaration.important) accessibilityAndPrintImportant += 1;
        });
      });
    }
    expect(accessibilityAndPrintImportant).toBe(totalImportant);
    expect(totalImportant).toBeLessThan(20);
  });

  it("does not repeat selector-property declarations in any loaded route bundle", () => {
    const activityCore = [
      "30-start-learning-core.css",
      "40-learning-flow.css",
      "50-exercise-workspace.css",
      "60-exercise-stability.css",
      "61-exercise-feedback.css",
      "70-exercise-flow.css",
      "83-home-glossary.css",
    ];
    const routeBundles = new Map<string, string[]>([
      ["global", globalModules],
      ["home", [...globalModules, "83-home-glossary.css"]],
      ["start", [...globalModules, "30-start-learning-core.css", "31-start-page-flow.css", "83-home-glossary.css"]],
      ["learn-train", [...globalModules, ...activityCore]],
      ["quiz", [...globalModules, ...activityCore, "71-quiz-remedial.css"]],
      ["text-game", [...globalModules, "72-text-game.css"]],
      ["paths-dashboard", [...globalModules, "73-paths-dashboard.css"]],
      ["speech-game", [...globalModules, "74-speech-game.css"]],
    ]);

    for (const [routeName, modules] of routeBundles) {
      const seen = new Map<string, string>();
      const repeated: string[] = [];
      for (const moduleName of new Set(modules)) {
        const parsed = postcss.parse(readFileSync(resolve(root, "app/styles", moduleName), "utf8"));
        parsed.walkRules((rule) => {
          const context: string[] = [];
          let insideKeyframes = false;
          let parent: Node | undefined = rule.parent;
          while (parent) {
            if (parent.type === "atrule") {
              const atRule = parent as AtRule;
              if (atRule.name.endsWith("keyframes")) insideKeyframes = true;
              else if (atRule.name !== "layer") context.unshift(`@${atRule.name} ${atRule.params}`);
            }
            parent = parent.parent;
          }
          if (insideKeyframes) return;

          for (const selector of rule.selectors) {
            for (const node of rule.nodes) {
              if (node.type !== "decl") continue;
              const key = [context.join("|"), selector.trim(), node.prop, node.important].join("::");
              const firstModule = seen.get(key);
              if (firstModule) repeated.push(`${selector.trim()}: ${node.prop} (${firstModule} → ${moduleName})`);
              else seen.set(key, moduleName);
            }
          }
        });
      }
      expect(repeated, `تكرارات CSS في حزمة ${routeName}`).toEqual([]);
    }
  });

  it("keeps unconditional component selectors inside a bounded ownership stack", () => {
    const selectorOwners = new Map<string, Set<string>>();
    for (const moduleName of expectedModules) {
      const parsed = postcss.parse(readFileSync(resolve(root, "app/styles", moduleName), "utf8"));
      parsed.walkRules((rule) => {
        let parent: Node | undefined = rule.parent;
        let conditional = false;
        let insideKeyframes = false;
        while (parent) {
          if (parent.type === "atrule") {
            const atRule = parent as AtRule;
            if (atRule.name.endsWith("keyframes")) insideKeyframes = true;
            if (["media", "supports", "container"].includes(atRule.name)) conditional = true;
          }
          parent = parent.parent;
        }
        if (conditional || insideKeyframes) return;
        for (const selector of rule.selectors) {
          const ownerSet = selectorOwners.get(selector.trim()) ?? new Set<string>();
          ownerSet.add(moduleName);
          selectorOwners.set(selector.trim(), ownerSet);
        }
      });
    }

    const infrastructureExceptions = new Set([
      ":root",
      "html",
      "body",
      ".exercise-page-shell",
      ".thinking-bubble",
      ".thinking-layout.start-style-layout",
      ".exercise-hero-card",
      ".topic-branch-card",
    ]);
    const overlyDistributed = [...selectorOwners]
      .filter(([selector, owners]) => owners.size > 3 && !infrastructureExceptions.has(selector))
      .map(([selector, owners]) => `${selector}: ${[...owners].join(" → ")}`);
    expect(overlyDistributed).toEqual([]);

    const distributedCount = [...selectorOwners.values()].filter((owners) => owners.size > 1).length;
    expect(distributedCount).toBeLessThan(180);
  });

  it("does not retain styles for removed exercise branches", () => {
    const combined = expectedModules
      .map((moduleName) => readFileSync(resolve(root, "app/styles", moduleName), "utf8"))
      .join("\n");
    const removedClasses = [
      "step-review-card",
      "practice-correction-board",
      "practice-fast-option",
      "algorithm-card-stack",
      "algorithm-card-number",
      "algorithm-card-answer",
      "algorithm-card-result",
      "answer-drag-mini",
      "paths-activity-frame",
      "sequential-live-result",
      "step-transform-chip",
      "step-transform-check",
      "next-step-focus-cue",
      "practice-reward-burst",
      "practice-reward-star",
      "practice-teacher-explanation",
    ];
    for (const className of removedClasses) {
      expect(combined, `${className} عاد إلى CSS`).not.toContain(`.${className}`);
    }
  });

});
