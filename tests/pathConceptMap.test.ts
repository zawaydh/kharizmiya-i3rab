import { describe, expect, test } from "vitest";
import { buildConceptMapGraph } from "../lib/paths/conceptMapGraph";

describe("الخريطة المفاهيمية للمسارات البصرية", () => {
  test("تعرض جميع الفروع الممكنة لا المسار الصحيح للمثال فقط", () => {
    const graph = buildConceptMapGraph({
      startNodeId: "root",
      nodes: {
        root: {
          id: "root",
          answers: [
            { text: "اسم", next: "nounNode" },
            { text: "فعل", next: "verbNode" },
          ],
        },
        nounNode: { id: "nounNode" },
        verbNode: { id: "verbNode" },
      },
    });
    expect(graph.childrenMap.get("root")).toEqual(["nounNode", "verbNode"]);
    expect(graph.edges).toEqual(expect.arrayContaining([
      { from: "root", to: "nounNode", label: "اسم" },
      { from: "root", to: "verbNode", label: "فعل" },
    ]));
  });

  test("تجمع فروع الانتقال الشرطي داخل الخريطة", () => {
    const graph = buildConceptMapGraph({
      startNodeId: "root",
      nodes: {
        root: {
          id: "root",
          answers: [{
            text: "يتحدد بحسب المثال",
            next: "fallback",
            nextByFact: { map: { a: "branchA", b: "branchB" }, default: "fallback" },
          }],
        },
        branchA: { id: "branchA" },
        branchB: { id: "branchB" },
        fallback: { id: "fallback" },
      },
    });
    expect(graph.childrenMap.get("root")).toEqual(["fallback", "branchA", "branchB"]);
  });
});
