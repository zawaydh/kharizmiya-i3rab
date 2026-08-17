import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    pool: "forks",
    // DOM/jsdom tests are intentionally serialized for deterministic, Windows-safe worker startup.
    fileParallelism: false,
    include: ["tests/**/*.dom.test.tsx"],
    exclude: ["e2e/**", "tests/integration/**", "node_modules/**", ".next/**"],
    testTimeout: 15_000,
    hookTimeout: 15_000,
  },
});
