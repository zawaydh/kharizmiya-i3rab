import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    pool: "threads",
    fileParallelism: false,
    include: ["tests/**/*.dom.test.tsx"],
    exclude: ["e2e/**", "tests/integration/**", "node_modules/**", ".next/**"],
    testTimeout: 15_000,
    hookTimeout: 15_000,
  },
});
