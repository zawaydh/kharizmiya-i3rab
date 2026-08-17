import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    pool: "forks",
    // Use child processes instead of worker_threads for stable cross-platform execution, especially on Windows.
    // Keep the core suite serialized; DOM suites run in fresh isolated Vitest processes via vitest.dom.config.ts.
    fileParallelism: false,
    exclude: ["e2e/**", "tests/integration/**", "tests/**/*.dom.test.tsx", "node_modules/**", ".next/**"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json-summary"],
      reportsDirectory: "coverage",
      include: [
        "lib/errorReports.ts",
        "lib/progressEvents.ts",
        "lib/progressMerge.ts",
        "lib/exercise/engine.ts",
        "lib/exercise/progress.ts",
        "lib/server/progressRepository.ts",
        "lib/server/progressVerification.ts",
      ],
      thresholds: {
        branches: 75,
        functions: 80,
        lines: 80,
        statements: 80,
      },
    },
  },
});
