import { describe, expect, it } from "vitest";
import { readFileSync, statSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(process.cwd());
const globalsPath = resolve(root, "app/globals.css");
const expectedModules = [
  "00-foundation.css",
  "10-shell-auth-exercise.css",
  "20-navigation-paths.css",
  "30-start-learning-core.css",
  "40-learning-flow.css",
  "50-exercise-workspace.css",
  "60-exercise-stability.css",
  "70-pages-games-dashboard.css",
  "80-clean-system.css",
];

describe("CSS architecture", () => {
  it("keeps globals.css as a small ordered import manifest", () => {
    const globals = readFileSync(globalsPath, "utf8");
    expect(Buffer.byteLength(globals, "utf8")).toBeLessThan(1200);

    const imports = [...globals.matchAll(/@import\s+"\.\/styles\/([^"]+)";/g)].map(
      (match) => match[1],
    );
    expect(imports).toEqual(expectedModules);
  });

  it("keeps every imported CSS module present and non-empty", () => {
    for (const moduleName of expectedModules) {
      const modulePath = resolve(root, "app/styles", moduleName);
      expect(statSync(modulePath).size).toBeGreaterThan(100);
    }
  });

  it("uses exactly one active final visual system", () => {
    const globals = readFileSync(globalsPath, "utf8");
    expect(globals).toContain('80-clean-system.css');
    expect(globals).not.toContain('95-classic-readable.css');
    expect(globals).not.toContain('96-contrast-menu-path-fixes.css');
    expect(globals).not.toContain('97-unified-workspaces.css');
    expect(globals).not.toContain('98-stable-activity-system.css');
  });
  it("keeps one navigation implementation without legacy duplicates", () => {
    const navbar = readFileSync(resolve(root, "app/components/Navbar.js"), "utf8");
    const topicDropdown = readFileSync(resolve(root, "app/components/TopicDropdown.jsx"), "utf8");
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
    expect(sidebarModules).toEqual(["80-clean-system.css"]);

    for (const { css } of styleContents) {
      expect(css).not.toContain(".platform-navbar");
      expect(css).not.toContain("--platform-nav-height");
    }
  });

});
