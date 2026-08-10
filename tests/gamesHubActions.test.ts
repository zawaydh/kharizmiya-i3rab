import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("games hub actions", () => {
  it("keeps all game entry buttons visible and linked", () => {
    const root = process.cwd();
    const page = readFileSync(resolve(root, "app/games/page.tsx"), "utf8");
    const css = readFileSync(resolve(root, "app/styles/74-speech-game.css"), "utf8");

    expect(page).toContain('href="/games/where-is-my-place"');
    expect(page).toContain('href="/games/which-object"');
    expect(page).toContain('href="/games/who-is-with-me"');
    expect(page).toContain('href="/games/markati"');
    expect(page).toContain('علامتي');
    expect(page).toContain('href="/i3rab-in-our-speech"');
    expect(page).toContain("games-hub-open-button");
    expect(css).toContain(".games-hub-card .btn-soft,.games-hub-open-button");
    expect(css).toContain("color:var(--clean-primary-text);background:#fff;border:1px solid var(--clean-primary)");
  });
});
