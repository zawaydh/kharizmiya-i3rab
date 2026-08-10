import { readFileSync } from "node:fs";
import { resolve } from "node:path";

export const CLEAN_SYSTEM_FILES = [
  "80-clean-system.css",
  "81-clean-responsive.css",
  "82-learning-stability.css",
  "83-home-glossary.css",
] as const;

export function readCleanSystemCss() {
  return CLEAN_SYSTEM_FILES
    .map((file) => readFileSync(resolve(process.cwd(), "app/styles", file), "utf8"))
    .join("\n");
}
