import { describe, expect, it } from "vitest";
import { isSafeInternalUrl } from "../lib/authHelpers";

describe("isSafeInternalUrl", () => {
  it.each([
    "/topics?welcome=1",
    "/visual-paths/verb-present#result",
    "/auth?next=topics",
  ])("accepts a same-site path: %s", (value) => {
    expect(isSafeInternalUrl(value)).toBe(true);
  });

  it.each([
    "https://evil.example",
    "//evil.example",
    "/\\evil.example",
    "/%5cevil.example",
    "/%5C%5Cevil.example",
    "/%2f%2fevil.example",
    "javascript:alert(1)",
    "/topics\nhttps://evil.example",
    "topics",
    "",
  ])("rejects an unsafe or non-internal target: %s", (value) => {
    expect(isSafeInternalUrl(value)).toBe(false);
  });

  it.each([null, undefined, 7, {}, []])("rejects a non-string target", (value) => {
    expect(isSafeInternalUrl(value)).toBe(false);
  });
});
