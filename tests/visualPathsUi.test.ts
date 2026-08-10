import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(process.cwd());
const componentPath = resolve(root, "app/components/DynamicPathTree.tsx");
const modelPath = resolve(root, "app/components/visual-path/model.ts");
const buildersPath = resolve(root, "app/components/visual-path/visualMapBuilders.ts");
const presentMapPath = resolve(root, "app/components/visual-path/presentVerbMap.ts");
const kanaMapPath = resolve(root, "app/components/visual-path/kanaVisualMap.ts");
const layoutPath = resolve(root, "app/components/visual-path/graphLayout.ts");
const sessionPath = resolve(root, "app/components/visual-path/mapSession.ts");
const typesPath = resolve(root, "app/components/visual-path/types.ts");
const pathsCssPath = resolve(root, "app/paths/visual-paths.css");
const presentBuiltPositionPath = resolve(root, "lib/presentVerbBuiltPosition.ts");

const source = (path: string) => readFileSync(path, "utf8");

describe("نظام المسارات البصرية الجديد", () => {
  it("يستبدل النظام القديم بمكوّن واحد وتخطيط شجري واحد", () => {
    const component = source(componentPath);
    const model = source(modelPath);
    const layout = source(layoutPath);
    const combined = `${component}
${model}
${layout}`;
    expect(model).toContain("function buildGenericVisualMap");
    expect(layout).toContain("function buildTreeLayout");
    expect(component).toContain('from "./visual-path/model"');
    expect(component).toContain('from "./visual-path/graphLayout"');
    expect(combined).not.toContain("buildOrthogonalRoutes");
    expect(combined).not.toContain("RouteMinHeap");
    expect(combined).not.toContain("layoutFixedDecisionMap");
  });

  it("يحافظ على أسماء الخيارات ويعرضها أسفل المعين بدل نعم ولا", () => {
    const component = source(componentPath);
    const builders = source(buildersPath);
    const types = source(typesPath);
    expect(types).toContain("type VisualChoice");
    expect(builders).toContain("function addFactOptions");
    expect(component).toContain("const choices = node.choices || []");
    expect(component).toContain("handleChoice(node, choice)");
    expect(component).toContain("{choice.label}</button>");
    expect(component).not.toContain(">نعم</button>");
    expect(component).not.toContain(">لا</button>");
  });

  it("يحافظ على المثال في عقدة البداية ويبرز الكلمة المطلوبة", () => {
    const component = source(componentPath);
    expect(component).toContain("example?.sentence");
    expect(component).toContain("example?.target");
    expect(component).toContain("<mark>{target}</mark>");
  });

  it("يظهر التلميح بعد الخطأ فقط ولا يضع زر تلميح دائمًا", () => {
    const component = source(componentPath);
    expect(component).toContain("if (!correct)");
    expect(component).toContain("visualPathWrongHint");
    expect(component).toContain("visual-path-hint");
    expect(component).not.toContain("hintBtn");
  });


  it("ينقل التركيز إلى التلميح ثم يعيده إلى خيارات العقدة النشطة", () => {
    const component = source(componentPath);
    expect(component).toContain("useId");
    expect(component).toContain("hintRef.current?.focus()");
    expect(component).toContain("firstActiveChoiceRef.current?.focus()");
    expect(component).toContain("tabIndex={-1}");
    expect(component).toContain("aria-pressed={selectedChoice}");
    expect(component).toContain("aria-describedby={active && hint ? hintId : undefined}");
  });

  it("يحتفظ بالإعراب النهائي الكامل داخل نتيجة المسار", () => {
    const component = source(componentPath);
    expect(component).toContain("example?.facts?.finalI3rab");
    expect(component).toContain("String(example.facts.finalI3rab)");
    expect(component).toContain("finalI3rab || node.fullText || node.text");
    expect(component).toContain("is-final");
  });

  it("يوفر مثالًا جديدًا وإعادة صحيحة وتكبيرًا وتوسيطًا تلقائيًا", () => {
    const component = source(componentPath);
    expect(component).toContain("مثال جديد");
    expect(component).toContain("إعادة المثال");
    expect(component).toContain("centerWorkArea");
    expect(component).toContain("تصغير المسار");
    expect(component).toContain("تكبير المسار");
    expect(component).toContain('container.scrollTo({ left, top, behavior: "auto" })');
  });

  it("يبني الخريطة المفاهيمية تدريجيًا ويخفي العقد التالية حتى الإجابة", () => {
    const component = source(componentPath);
    const model = source(modelPath);
    const session = source(sessionPath);
    const types = source(typesPath);
    const css = source(pathsCssPath);
    expect(model).toContain("buildConceptVisualMap");
    expect(model).toContain('kind: "outcome"');
    expect(types).toContain('"outcome"');
    expect(session).toContain("buildConceptVisualMap(fullMap)");
    expect(component).toContain("visibleVisualMap");
    expect(component).toContain("selectedEdgeIds.has(edge.id)");
    expect(component).toContain("visibleNodeIds.has(node.id)");
    expect(component).toContain('node.kind === "outcome"');
    expect(component).toContain("اختر الإجابة المناسبة");
    expect(css).toContain("visual-path-reveal");
    expect(css).toContain("place-items: start center");
    expect(css).toContain("scrollbar-gutter: stable both-edges");
    expect(css).toContain(".visual-path-node.is-outcome");
  });

  it("يحافظ على سياق المسار في الهاتف ويبرز الخيار المختار بعد الانتقال", () => {
    const component = source(componentPath);
    const css = source(pathsCssPath);
    expect(component).toContain("selectedChoiceKeys");
    expect(component).toContain("is-path-selected");
    expect(component).toContain('placement === "context"');
    expect(component).toContain("container.clientHeight * 0.56");
    expect(component).toContain("nodeFitZoom");
    expect(css).toContain(".visual-path-choice.is-path-selected");
    expect(css).toContain(".visual-path-choice.is-path-muted:disabled");
    expect(component).not.toContain("visual-path-token");
    expect(css).not.toContain("visual-path-token");
  });


  it("يستعمل تلميحات تشخيصية مخصصة لكل اختيار ويزيل شارة الكلمة المنفصلة", () => {
    const component = source(componentPath);
    const hints = source(resolve(root, "app/components/visual-path/hints.ts"));
    expect(component).toContain('from "./visual-path/hints"');
    expect(hints).toContain("function visualChoiceHint");
    expect(hints).toContain("export function visualPathWrongHint");
    expect(hints).toContain('id === "present:connection"');
    expect(component).not.toContain("visual-path-token");
  });

  it("يبدأ المضارع بالبناء ثم العامل ثم يصنّف صورة الفعل بخيارات مسمّاة", () => {
    const model = source(presentMapPath);
    const builtPosition = source(presentBuiltPositionPath);
    expect(model).toContain("function buildPresentVerbVisualMap");
    expect(model).toContain('rootId: "present:connection"');
    expect(model).toContain('const factorQuestion = `هل سُبق الفعل ${target} بـ…؟`');
    expect(model).toContain('label: "نون النسوة"');
    expect(model).toContain('label: "نون التوكيد"');
    expect(model).toContain('label: "ناصب"');
    expect(model).toContain('label: "جازم"');
    expect(model).toContain('label: "لم يُسبق بعامل"');
    expect(model).toContain('text: `ما صورة الفعل ${target}؟`');
    expect(model).toContain('label: "صحيح الآخر"');
    expect(model).toContain('label: "معتل الآخر"');
    expect(model).toContain('label: "من الأفعال الخمسة"');
    expect(model).not.toContain('text: `هل الفعل ${target} من الأفعال الخمسة؟`');
    expect(model).toContain('presentVerbBuiltResult({ build: "niswa"');
    expect(model).toContain('presentVerbBuiltResult({ build: "tawkid"');
    expect(builtPosition).toContain("فعل مضارع مبني على السكون لاتصاله بنون النسوة، في محل ${position}.");
    expect(builtPosition).toContain("فعل مضارع مبني على الفتح لاتصاله المباشر بنون التوكيد، في محل ${position}.");
    expect(builtPosition).toContain("الفعل هو في محل رفع؛ لأنه لم يُسبق بناصب أو جازم.");
    expect(builtPosition).toContain("الفعل هو في محل نصب؛ لأنه سُبق بناصب.");
    expect(builtPosition).toContain("الفعل هو في محل جزم؛ لأنه سُبق بجازم.");
    expect(model).toContain("مرفوع بضمة مقدرة\\nعلى الواو للثقل");
    expect(model).toContain("منصوب بفتحة مقدرة\\nعلى الألف للتعذر");
  });

  it("ينفذ خريطة كان الصحيحة من الوظيفة إلى النوع ثم العلامة أو المحل", () => {
    const model = source(kanaMapPath);
    expect(model).toContain("function buildKanaVisualMap");
    expect(model).toContain('label: "اسم الناسخ"');
    expect(model).toContain('label: "خبر الناسخ"');
    expect(model).toContain('label: "اسم مستتر"');
    expect(model).toContain("اسم الناسخ مرفوع");
    expect(model).toContain("خبر الناسخ منصوب");
    expect(model).toContain("جملة فعلية\\nفي محل نصب خبر الناسخ");
    expect(model).toContain("خبر مقدم جار ومجرور");
  });

  it("يرسم الخطوط بزوايا مستقيمة ويضع خط النهاية خارج التفرعات", () => {
    const component = source(componentPath);
    const layout = source(layoutPath);
    const combined = `${component}
${layout}`;
    expect(layout).toContain("function edgePath");
    expect(layout).toContain("decisionChoiceAnchor");
    expect(layout).toContain(" V ${middleY} H ${endX} V ${endY}");
    expect(component).toContain("visual-path-terminal");
    expect(combined).not.toContain("__junction__");
    expect(combined).not.toContain("resultId}->__junction__");
  });

  it("يستخدم خطوطًا نظيفة بلا رؤوس أسهم ويضع التلميح في مساحة محجوزة", () => {
    const component = source(componentPath);
    const css = source(pathsCssPath);
    expect(component).not.toContain("markerEnd=");
    expect(component).not.toContain("visual-path-arrow");
    expect(component).toContain('visual-path-shell${hint ? " has-hint" : ""}');
    expect(css).toContain(".visual-path-shell.has-hint");
    expect(css).toContain("grid-template-rows: auto minmax(0, 1fr)");
    expect(css).not.toContain("position: absolute;\n  z-index: 20;\n  left: 50%;\n  bottom: 12px");
  });

  it("يوحّد حجم لوحة العمل والخطوط والعقد في جميع المسارات", () => {
    const css = source(pathsCssPath);
    expect(css).toContain("height: clamp(570px, calc(100svh - 105px), 860px)");
    expect(css).toContain("stroke-width: 1.05");
    expect(css).toContain(".visual-path-edge.is-selected");
    expect(css).toContain(".visual-path-edge.is-excluded");
    expect(css).toContain("-webkit-line-clamp: 4");
    expect(css).toContain("overflow-wrap: anywhere");
    expect(css).toContain(".visual-path-choice.is-option-1");
    expect(css).toContain(".visual-path-choice.is-option-3");
    expect(css).not.toContain("!important");
  });

  it("يحذف ملفات النظام القديم ولا يعيد تضخيم صفحة المسارات", () => {
    const component = source(componentPath);
    const model = source(modelPath);
    const builders = source(buildersPath);
    const presentMap = source(presentMapPath);
    const kanaMap = source(kanaMapPath);
    const layoutModule = source(layoutPath);
    const session = source(sessionPath);
    const types = source(typesPath);
    const css = source(pathsCssPath);
    expect(component.split(/\r?\n/).length).toBeLessThan(430);
    expect(model.split(/\r?\n/).length).toBeLessThan(250);
    expect(builders.split(/\r?\n/).length).toBeLessThan(80);
    expect(presentMap.split(/\r?\n/).length).toBeLessThan(250);
    expect(kanaMap.split(/\r?\n/).length).toBeLessThan(180);
    expect(layoutModule.split(/\r?\n/).length).toBeLessThan(180);
    expect(session.split(/\r?\n/).length).toBeLessThan(80);
    expect(types.split(/\r?\n/).length).toBeLessThan(150);
    expect(css.split(/\r?\n/).length).toBeLessThan(650);
    expect(() => source(resolve(root, "app/paths/paths-original.css"))).toThrow();
    const pathsLayout = source(resolve(root, "app/paths/layout.tsx"));
    expect(pathsLayout).toContain('import "./visual-paths.css"');
    expect(pathsLayout).not.toContain("paths-original.css");
  });
});
