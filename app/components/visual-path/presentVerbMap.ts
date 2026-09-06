import { presentVerbBuiltResult } from "../../../lib/presentVerbBuiltPosition";
import { addFactOptions, addResult, addStart } from "./visualMapBuilders";
import type { Example, VisualEdge, VisualMap, VisualNode } from "./types";

export function presentVerbResultText(example: Example | null) {
  if (!example) return "";
  const cover = example.covers?.[0] || "";
  const tool = String(example.facts?.toolWord || "").trim();
  const toolSuffix = tool ? ` بـ ${tool}` : "";
  const resultByCover: Record<string, string> = {
    "present.binaa.niswa": presentVerbBuiltResult({ build: "niswa", tool: String(example.facts?.tool || "none") }),
    "present.binaa.tawkid": presentVerbBuiltResult({ build: "tawkid", tool: String(example.facts?.tool || "none") }),
    "present.raf3.sahih": "فعل مضارع مرفوع.\nعلامة رفعه: الضمة الظاهرة على آخره.",
    "present.raf3.alif": "فعل مضارع مرفوع.\nعلامة رفعه: الضمة المقدرة على الألف منع من ظهورها التعذر.",
    "present.raf3.waw": "فعل مضارع مرفوع.\nعلامة رفعه: الضمة المقدرة على الواو منع من ظهورها الثقل.",
    "present.raf3.ya": "فعل مضارع مرفوع.\nعلامة رفعه: الضمة المقدرة على الياء منع من ظهورها الثقل.",
    "present.raf3.five": "فعل مضارع مرفوع.\nعلامة رفعه: ثبوت النون؛ لأنه من الأفعال الخمسة.",
    "present.nasb.sahih": `فعل مضارع منصوب${toolSuffix}.\nعلامة نصبه: الفتحة الظاهرة على آخره.`,
    "present.nasb.alif": `فعل مضارع منصوب${toolSuffix}.\nعلامة نصبه: الفتحة المقدرة على الألف منع من ظهورها التعذر.`,
    "present.nasb.waw": `فعل مضارع منصوب${toolSuffix}.\nعلامة نصبه: الفتحة الظاهرة على آخره.`,
    "present.nasb.ya": `فعل مضارع منصوب${toolSuffix}.\nعلامة نصبه: الفتحة الظاهرة على آخره.`,
    "present.nasb.five": `فعل مضارع منصوب${toolSuffix}.\nعلامة نصبه: حذف النون؛ لأنه من الأفعال الخمسة.`,
    "present.jazm.sahih": `فعل مضارع مجزوم${toolSuffix}.\nعلامة جزمه: السكون.`,
    "present.jazm.weak.alif": `فعل مضارع مجزوم${toolSuffix}.\nعلامة جزمه: حذف حرف العلة؛ وحرف العلة المحذوف الألف.`,
    "present.jazm.weak.waw": `فعل مضارع مجزوم${toolSuffix}.\nعلامة جزمه: حذف حرف العلة؛ وحرف العلة المحذوف الواو.`,
    "present.jazm.weak.ya": `فعل مضارع مجزوم${toolSuffix}.\nعلامة جزمه: حذف حرف العلة؛ وحرف العلة المحذوف الياء.`,
    "present.jazm.five": `فعل مضارع مجزوم${toolSuffix}.\nعلامة جزمه: حذف النون؛ لأنه من الأفعال الخمسة.`,
  };
  const base = resultByCover[cover] || "";
  if (example.facts?.shape !== "five") return base;
  const attached = example.facts?.attached;
  if (attached === "waw") return `${base}\nواو الجماعة: ضمير متصل مبني في محل رفع فاعل.\nالألف: ألف فارقة لا محل لها من الإعراب.`;
  if (attached === "alif2") return `${base}\nألف الاثنين: ضمير متصل مبني في محل رفع فاعل.`;
  if (attached === "yaa") return `${base}\nياء المخاطبة: ضمير متصل مبني في محل رفع فاعل.`;
  return base;
}

export function buildPresentVerbVisualMap(example: Example | null): VisualMap {
  const nodes: VisualNode[] = [];
  const edges: VisualEdge[] = [];
  const target = example?.target ? `«${example.target}»` : "الفعل";
  const factorQuestion = `هل سُبق الفعل ${target} بـ…؟`;

  addFactOptions(nodes, edges, {
    id: "present:connection",
    text: `بماذا اتصل الفعل ${target}؟`,
    hint: "ابدأ بفحص نون النسوة ونون التوكيد؛ فهما تنقلان المضارع من الإعراب إلى البناء.",
    choices: [
      {
        id: "niswa",
        label: "نون النسوة",
        target: "present:niswa:factor",
        test: { fact: "buildConnection", equals: "niswa" },
        conceptText: `فعل مضارع مبني على السكون لاتصاله بنون النسوة\n${target}`,
      },
      {
        id: "tawkid",
        label: "نون التوكيد",
        target: "present:tawkid:factor",
        test: { fact: "buildConnection", equals: "tawkid" },
        conceptText: `${target}: اتصل بنون التوكيد\nفبُني الفعل على الفتح`,
      },
      {
        id: "none",
        label: "لا نون النسوة ولا نون التوكيد",
        target: "present:factor",
        test: { fact: "buildConnection", equals: "none" },
        conceptText: `${target}: لم يتصل بنون النسوة ولا بنون التوكيد\nفهو فعل مضارع معرب`,
      },
    ],
  });

  addFactOptions(nodes, edges, {
    id: "present:niswa:factor",
    text: factorQuestion,
    hint: "الفعل مبني على السكون، والعامل السابق يحدد محله: رفع أو نصب أو جزم.",
    choices: [
      { id: "nasb", label: "ناصب", target: "present:result:niswa:nasb", test: { fact: "tool", equals: "nasb" } },
      { id: "jazm", label: "جازم", target: "present:result:niswa:jazm", test: { fact: "tool", equals: "jazm" } },
      { id: "raf", label: "لا ناصب ولا جازم قبله", target: "present:result:niswa:raf", test: { fact: "tool", equals: "none" } },
    ],
  });
  addFactOptions(nodes, edges, {
    id: "present:tawkid:factor",
    text: factorQuestion,
    hint: "الفعل مبني على الفتح، والعامل السابق يحدد محله: رفع أو نصب أو جزم.",
    choices: [
      { id: "nasb", label: "ناصب", target: "present:result:tawkid:nasb", test: { fact: "tool", equals: "nasb" } },
      { id: "jazm", label: "جازم", target: "present:result:tawkid:jazm", test: { fact: "tool", equals: "jazm" } },
      { id: "raf", label: "لا ناصب ولا جازم قبله", target: "present:result:tawkid:raf", test: { fact: "tool", equals: "none" } },
    ],
  });

  addFactOptions(nodes, edges, {
    id: "present:factor",
    text: factorQuestion,
    hint: "الناصب يجعل المضارع منصوبًا، والجازم يجعله مجزومًا، وإذا لم يسبقه عامل فهو مرفوع.",
    choices: [
      {
        id: "nasb",
        label: "ناصب",
        target: "present:nasb:shape",
        test: { fact: "tool", equals: "nasb" },
        conceptText: "فعل مضارع منصوب",
      },
      {
        id: "jazm",
        label: "جازم",
        target: "present:jazm:shape",
        test: { fact: "tool", equals: "jazm" },
        conceptText: "فعل مضارع مجزوم",
      },
      {
        id: "raf",
        label: "لا ناصب ولا جازم قبله",
        target: "present:raf:shape",
        test: { fact: "tool", equals: "none" },
        conceptText: "فعل مضارع مرفوع",
      },
    ],
  });

  addFactOptions(nodes, edges, {
    id: "present:nasb:shape",
    text: `ما صورة الفعل ${target}؟`,
    hint: "صورة الفعل تحدد العلامة: الصحيح الآخر بالفتحة الظاهرة، والمعتل بحسب حرف العلة، والأفعال الخمسة بحذف النون.",
    choices: [
      { id: "sahih", label: "صحيح الآخر", target: "present:result:nasb:sahih", test: { fact: "shape", equals: "sahih" } },
      { id: "weak", label: "معتل الآخر", target: "present:nasb:letter", test: { fact: "shape", equals: "weak" } },
      { id: "five", label: "من الأفعال الخمسة", target: "present:result:nasb:five", test: { fact: "shape", equals: "five" } },
    ],
  });
  addFactOptions(nodes, edges, {
    id: "present:jazm:shape",
    text: `ما صورة الفعل ${target}؟`,
    hint: "صورة الفعل تحدد العلامة: الصحيح الآخر بالسكون، والمعتل بحذف حرف العلة، والأفعال الخمسة بحذف النون.",
    choices: [
      { id: "sahih", label: "صحيح الآخر", target: "present:result:jazm:sahih", test: { fact: "shape", equals: "sahih" } },
      { id: "weak", label: "معتل الآخر", target: "present:result:jazm:weak", test: { fact: "shape", equals: "weak" } },
      { id: "five", label: "من الأفعال الخمسة", target: "present:result:jazm:five", test: { fact: "shape", equals: "five" } },
    ],
  });
  addFactOptions(nodes, edges, {
    id: "present:raf:shape",
    text: `ما صورة الفعل ${target}؟`,
    hint: "صورة الفعل تحدد العلامة: الصحيح الآخر بالضمة الظاهرة، والمعتل بالضمة المقدرة، والأفعال الخمسة بثبوت النون.",
    choices: [
      { id: "sahih", label: "صحيح الآخر", target: "present:result:raf:sahih", test: { fact: "shape", equals: "sahih" } },
      { id: "weak", label: "معتل الآخر", target: "present:raf:letter", test: { fact: "shape", equals: "weak" } },
      { id: "five", label: "من الأفعال الخمسة", target: "present:result:raf:five", test: { fact: "shape", equals: "five" } },
    ],
  });

  addFactOptions(nodes, edges, {
    id: "present:nasb:letter",
    text: `ما حرف العلة في آخر ${target}؟`,
    hint: "تُقدّر الفتحة على الألف، وتظهر على الواو والياء.",
    choices: [
      { id: "alif", label: "ألف", target: "present:result:nasb:alif", test: { fact: "weakLetter", equals: "alif" } },
      { id: "waw", label: "واو", target: "present:result:nasb:waw", test: { fact: "weakLetter", equals: "waw" } },
      { id: "ya", label: "ياء", target: "present:result:nasb:ya", test: { fact: "weakLetter", equals: "ya" } },
    ],
  });
  addFactOptions(nodes, edges, {
    id: "present:raf:letter",
    text: `ما حرف العلة في آخر ${target}؟`,
    hint: "تُقدّر الضمة على الألف للتعذر، وعلى الواو والياء للثقل.",
    choices: [
      { id: "alif", label: "ألف", target: "present:result:raf:alif", test: { fact: "weakLetter", equals: "alif" } },
      { id: "waw", label: "واو", target: "present:result:raf:waw", test: { fact: "weakLetter", equals: "waw" } },
      { id: "ya", label: "ياء", target: "present:result:raf:ya", test: { fact: "weakLetter", equals: "ya" } },
    ],
  });

  addResult(nodes, "present:result:niswa:raf", "مبني على السكون\nفي محل رفع");
  addResult(nodes, "present:result:niswa:nasb", "مبني على السكون\nفي محل نصب");
  addResult(nodes, "present:result:niswa:jazm", "مبني على السكون\nفي محل جزم");
  addResult(nodes, "present:result:tawkid:raf", "مبني على الفتح\nفي محل رفع");
  addResult(nodes, "present:result:tawkid:nasb", "مبني على الفتح\nفي محل نصب");
  addResult(nodes, "present:result:tawkid:jazm", "مبني على الفتح\nفي محل جزم");
  addResult(nodes, "present:result:nasb:five", "منصوب بحذف النون\nلأنه من الأفعال الخمسة");
  addResult(nodes, "present:result:nasb:sahih", "منصوب بالفتحة الظاهرة");
  addResult(nodes, "present:result:nasb:alif", "منصوب بفتحة مقدرة\nعلى الألف للتعذر");
  addResult(nodes, "present:result:nasb:waw", "منصوب بالفتحة الظاهرة\nعلى الواو");
  addResult(nodes, "present:result:nasb:ya", "منصوب بالفتحة الظاهرة\nعلى الياء");
  addResult(nodes, "present:result:jazm:five", "مجزوم بحذف النون\nلأنه من الأفعال الخمسة");
  addResult(nodes, "present:result:jazm:weak", "مجزوم بحذف حرف العلة");
  addResult(nodes, "present:result:jazm:sahih", "مجزوم بالسكون");
  addResult(nodes, "present:result:raf:five", "مرفوع بثبوت النون\nلأنه من الأفعال الخمسة");
  addResult(nodes, "present:result:raf:sahih", "مرفوع بالضمة الظاهرة");
  addResult(nodes, "present:result:raf:alif", "مرفوع بضمة مقدرة\nعلى الألف للتعذر");
  addResult(nodes, "present:result:raf:waw", "مرفوع بضمة مقدرة\nعلى الواو للثقل");
  addResult(nodes, "present:result:raf:ya", "مرفوع بضمة مقدرة\nعلى الياء للثقل");

  addStart(nodes, edges, "present:connection", example?.sentence || "فعل مضارع");
  return { nodes, edges, rootId: "present:connection" };
}

