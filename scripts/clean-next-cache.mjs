import { rm } from "node:fs/promises";
import { resolve } from "node:path";

const nextDirectory = resolve(process.cwd(), ".next");
await rm(nextDirectory, { recursive: true, force: true });
console.log("Cleared .next cache.");
