import { describe, expect, test } from "vitest";
import { imperativeVerbTree } from "../content/trees/verb_imperative";
import { cleanKanaTree } from "../content/trees/clean_kana";
import { faelTree } from "../content/trees/fael";
import { munadaTree } from "../content/trees/munada";
import { imperativeVerbExamples } from "../content/examples/verb_imperative.examples";
import { cleanKanaExamples } from "../content/examples/clean_kana.examples";
import { faelExamples } from "../content/examples/fael.examples";
import { munadaExamples } from "../content/examples/munada.examples";
import { buildRunnerState } from "../lib/exercise/runner";
import { safePracticeFinalLabel, type QuizExampleLike } from "../lib/exercise/quiz";
import {
  buildPracticeCorrectRoute,
  buildPracticeDirectHint,
  buildPracticeDirectOptions,
  practiceExpectedLabelForExample,
  practiceExpectedLabelFromRoute,
  practiceOptionScope,
} from "../app/components/exercise/ExercisePracticeFlow";
import {
  buildPracticePolicyDistractors,
  buildPracticePolicyGuidance,
  practiceGrammarPolicyAllows,
} from "../lib/exercise/practiceGrammarPolicy";

function normalized(text: string) {
  return String(text || "")
    .replace(/[.!؟:：؛،«»"'()[\]{}\s]/gu, "")
    .trim();
}

function expectCoherentOption(option: string) {
  if (option.includes("مرفوع")) {
    expect(option).not.toMatch(/علامة (?:نصبه|جره|جزمه)/u);
  }
  if (option.includes("منصوب")) {
    expect(option).not.toMatch(/علامة (?:رفعه|جره|جزمه)/u);
  }
  if (option.includes("مجرور")) {
    expect(option).not.toMatch(/علامة (?:رفعه|نصبه|جزمه)/u);
  }
  if (option.includes("مجزوم")) {
    expect(option).not.toMatch(/علامة (?:رفعه|نصبه|جره)/u);
  }
  expect(option).not.toContain("مبتدأ الفعل الناسخ");
}

describe("عقد تدرب الموحد", () => {
  test("الخيارات فريدة ومن المستوى نفسه وتتضمن النتيجة الصحيحة", () => {
    const example = imperativeVerbExamples.find((item) => item.id === "im-delete-letter-alif");
    expect(example).toBeDefined();
    if (!example) return;

    const state = buildRunnerState(imperativeVerbTree, "practice", example);
    const expected = practiceExpectedLabelForExample(
      safePracticeFinalLabel(imperativeVerbTree, example as QuizExampleLike, example.covers[0] || ""),
      example,
    );
    const options = buildPracticeDirectOptions({
      tree: imperativeVerbTree,
      mode: "practice",
      example,
      state,
      practiceExpectedLabel: expected,
    });

    expect(options).toContain(expected);
    expect(new Set(options).size).toBe(options.length);
    expect(options.length).toBeGreaterThanOrEqual(2);
    expect(options.length).toBeLessThanOrEqual(3);
    expect(new Set(options.map(practiceOptionScope))).toEqual(new Set([practiceOptionScope(expected)]));
  });

  test("التصحيح يعرض خطوات الحل ويكشف النتيجة النهائية للتثبيت", () => {
    const example = imperativeVerbExamples.find((item) => item.id === "im-delete-letter-alif");
    expect(example).toBeDefined();
    if (!example) return;

    const state = buildRunnerState(imperativeVerbTree, "practice", example);
    const expected = practiceExpectedLabelForExample(
      safePracticeFinalLabel(imperativeVerbTree, example as QuizExampleLike, example.covers[0] || ""),
      example,
    );
    const route = buildPracticeCorrectRoute({
      tree: imperativeVerbTree,
      mode: "practice",
      example,
      state,
      practiceExpectedLabel: expected,
    });

    expect(route.steps.length).toBeGreaterThanOrEqual(1);
    expect(route.steps.length).toBeLessThanOrEqual(4);
    expect(route.steps.join(" ")).not.toMatch(/^اختيارك/u);
    expect(normalized(route.finalAnswer)).toBe(normalized(expected));
    expect(imperativeVerbTree.nodes[route.nextState.currentNodeId]?.type).toBe("result");
  });

  test("دعنا نراجعها تعيد خطوات كان منفصلة وبالترتيب", () => {
    const example = cleanKanaExamples.find((item) => item.id === "ka-08");
    expect(example).toBeDefined();
    if (!example) return;

    const state = buildRunnerState(cleanKanaTree, "practice", example);
    const expected = practiceExpectedLabelFromRoute({
      tree: cleanKanaTree,
      mode: "practice",
      example,
    });
    const route = buildPracticeCorrectRoute({
      tree: cleanKanaTree,
      mode: "practice",
      example,
      state,
      practiceExpectedLabel: expected,
      topicId: "kana-wa-akhawatuha",
    });

    expect(route.steps).toHaveLength(4);
    expect(route.steps[0]).toMatch(/خبر الفعل الناسخ|خبر كان/u);
    expect(route.steps[1]).toMatch(/حكم .*النصب/u);
    expect(route.steps[2]).toMatch(/جمع مذكر سالم/u);
    expect(route.steps[3]).toMatch(/علامة النصب.*الياء/u);
  });

  test("دعنا نراجعها في فعل الأمر تذكر خطوات حذف النون", () => {
    const example = imperativeVerbExamples.find(
      (item) => item.id === "im-delete-noon-waw",
    );
    expect(example).toBeDefined();
    if (!example) return;

    const state = buildRunnerState(imperativeVerbTree, "practice", example);
    const expected = practiceExpectedLabelFromRoute({
      tree: imperativeVerbTree,
      mode: "practice",
      example,
    });
    const route = buildPracticeCorrectRoute({
      tree: imperativeVerbTree,
      mode: "practice",
      example,
      state,
      practiceExpectedLabel: expected,
    });

    expect(route.steps.length).toBeGreaterThanOrEqual(3);
    expect(route.steps[0]).toContain("فعل أمر");
    expect(route.steps[1]).toContain("واو الجماعة");
    expect(route.steps[2]).toContain("الأفعال الخمسة");
    expect(route.steps[2]).toContain("حذف النون");
  });
  test("التصحيح يفصل الحكم الإعرابي عن علامته", () => {
    const example = faelExamples.find((item) => item.id === "fa-01");
    expect(example).toBeDefined();
    if (!example) return;

    const state = buildRunnerState(faelTree, "practice", example);
    const expected = practiceExpectedLabelFromRoute({
      tree: faelTree,
      mode: "practice",
      example,
    });
    const route = buildPracticeCorrectRoute({
      tree: faelTree,
      mode: "practice",
      example,
      state,
      practiceExpectedLabel: expected,
      topicId: "fael",
    });

    const correction = route.steps.join(" ");
    expect(correction).toContain("فاعل");
    expect(correction).toContain("مرفوع");
    expect(correction).toContain("علامة رفع المفرد الصحيح الآخر الضمة");
    expect(route.finalAnswer).toContain("وعلامة رفعه الضمة الظاهرة على آخره");
    expect(correction).not.toContain("رفعته الضمة");
  });

  test("التصحيح لا يبدأ بتشخيص اختيار الطالب", () => {
    const example = imperativeVerbExamples.find((item) => item.id === "im-delete-letter-alif");
    expect(example).toBeDefined();
    if (!example) return;

    const state = buildRunnerState(imperativeVerbTree, "practice", example);
    const expected = practiceExpectedLabelFromRoute({
      tree: imperativeVerbTree,
      mode: "practice",
      example,
    });
    const route = buildPracticeCorrectRoute({
      tree: imperativeVerbTree,
      mode: "practice",
      example,
      state,
      practiceExpectedLabel: expected,
      wrongOption: "فعل أمر مبني على السكون.",
    });

    expect(route.steps.join(" ")).not.toContain("اختيارك");
  });

  test("تصحيح اسم الهدف لا يغيّر نتيجة مفتاح الكلمة الأولى", () => {
    const example: QuizExampleLike = {
      id: "routing-target-guard",
      target: "كتبَ",
      facts: {
        finalI3rab: "كتبَ: فعل ماضٍ مبني على الفتح.",
      },
    };

    const label = practiceExpectedLabelForExample(
      "عرفت مفتاح الجملة: الكلمة الأولى فعل ماضٍ. راجع باب الفعل الماضي.",
      example,
    );

    expect(label).toContain("عرفت مفتاح الجملة");
    expect(label).toContain("الكلمة الأولى فعل ماض");
    expect(label).not.toMatch(/^كتبَ[:：]/u);
  });

  test("التلميح الأول قصير والتلميح الثاني أكثر تقدما", () => {
    const example = munadaExamples.find((item) => item.id === "mn-03");
    expect(example).toBeDefined();
    if (!example) return;

    const state = buildRunnerState(munadaTree, "practice", example);
    const first = buildPracticeDirectHint({ tree: munadaTree, mode: "practice", state }, 1);
    const second = buildPracticeDirectHint({ tree: munadaTree, mode: "practice", state }, 2);

    expect(first.split(/\r?\n/).filter(Boolean).length).toBeLessThanOrEqual(2);
    expect(second.split(/\r?\n/).filter(Boolean).length).toBeLessThanOrEqual(3);
    expect(first).toMatch(/[؟?]/u);
    expect(first).not.toMatch(/الإجابة الصحيحة هي|لذلك تكون الإجابة الصحيحة/u);
    expect(second).not.toMatch(/الإجابة الصحيحة هي|لذلك تكون الإجابة الصحيحة/u);
    expect(normalized(second)).not.toBe(normalized(first));
  });
});

describe("مصدر النتيجة النهائية في تدرب", () => {
  test("يحافظ على تفاصيل العلامة عندما توسع finalI3rab النتيجة نفسها", () => {
    const example: QuizExampleLike = {
      id: "practice-full-label",
      target: "تكتبون",
      facts: {
        finalI3rab: "تكتبون: فعل مضارع مرفوع. وعلامة رفعه ثبوت النون؛ لأنه من الأفعال الخمسة.",
      },
    };

    const label = practiceExpectedLabelForExample("فعل مضارع مرفوع.", example);
    expect(label).toContain("فعل مضارع مرفوع");
    expect(label).toContain("ثبوت النون");
    expect(label).toContain("الأفعال الخمسة");
  });

  test("يأخذ السطر الخاص بالمطلوب ولا يسحب إعراب كلمة أخرى أو سبب الاختيار", () => {
    const example: QuizExampleLike = {
      id: "target-only",
      target: "أمامَ",
      facts: {
        finalI3rab:
          "أمامَ: مفعول فيه منصوب، وعلامة نصبه الفتحة الظاهرة على آخره.\nالبيتِ: مضاف إليه مجرور.\nسبب الاختيار: لأنه حدد المكان.",
      },
    };

    const label = practiceExpectedLabelForExample(
      "أمامَ: مفعول فيه منصوب، وعلامة نصبه الفتحة الظاهرة على آخره.",
      example,
    );
    expect(label).toContain("مفعول فيه");
    expect(label).not.toContain("البيتِ:");
    expect(label).not.toContain("سبب الاختيار");

    const verbExample: QuizExampleLike = {
      id: "target-only-inline-secondary",
      target: "رجعوا",
      facts: {
        finalI3rab:
          "رجعوا: فعل ماضٍ مبني على الضم لاتصاله بواو الجماعة. وواو الجماعة: ضمير متصل مبني في محل رفع فاعل.",
      },
    };
    const verbLabel = practiceExpectedLabelForExample(
      "رجعوا: فعل ماضٍ مبني على الضم لاتصاله بواو الجماعة. وواو الجماعة: ضمير متصل مبني في محل رفع فاعل.",
      verbExample,
    );
    expect(verbLabel).toContain("فعل ماضٍ مبني على الضم");
    expect(verbLabel).toContain("وواو الجماعة:");
    expect(verbLabel).toContain("في محل رفع فاعل");
  });

  test("نتيجة التحويل تبقى قرار التصنيف نفسه ولا تقفز إلى إعراب موضوع آخر", () => {
    const routingWithExplicit: QuizExampleLike = {
      id: "routing-final",
      target: "العلمُ",
      facts: { finalI3rab: "العلمُ: مبتدأ مرفوع، وعلامة رفعه الضمة الظاهرة على آخره." },
    };
    const routingVerb: QuizExampleLike = {
      id: "routing-type-only",
      target: "يقرأُ",
      facts: { finalI3rab: "يقرأُ: فعل مضارع معرب مرفوع." },
    };
    const incompleteExample: QuizExampleLike = {
      id: "incomplete-final",
      target: "طموحي",
      facts: { finalI3rab: "طموحي: اسم الفعل الناسخ مرفوع، وعلامة رفعه الضمة المقدرة." },
    };

    const nounRouting = practiceExpectedLabelForExample(
      "الكلمة الأولى اسم؛ ننتقل بعدها إلى مسار الاسم.",
      routingWithExplicit,
    );
    expect(nounRouting).toContain("الكلمة الأولى اسم");
    expect(nounRouting).toContain("ننتقل");
    expect(nounRouting).not.toContain("مبتدأ");

    const verbRouting = practiceExpectedLabelForExample(
      "الكلمة الأولى فعل مضارع؛ ننتقل بعدها إلى مسار الفعل المضارع.",
      routingVerb,
    );
    expect(verbRouting).toContain("فعل مضارع");
    expect(verbRouting).toContain("ننتقل");
    expect(verbRouting).not.toContain("مرفوع");

    expect(
      practiceExpectedLabelForExample("طموحي:", incompleteExample),
    ).toContain("اسم الفعل الناسخ");
  });
});

describe("سياسة النحو المركزية لتدرب", () => {
  test("تفصل التصنيف عن الإعراب الكامل", () => {
    const correct = "فعل مضارع";
    const options = buildPracticePolicyDistractors(correct);

    expect(practiceOptionScope(correct)).toBe("routing");
    expect(options.length).toBe(2);
    expect(options).toEqual(expect.arrayContaining(["فعل ماضٍ.", "فعل أمر."]));
    expect(new Set(options.map(practiceOptionScope))).toEqual(new Set(["routing"]));

    expect(
      practiceOptionScope(
        "بَقُوا: فعل ماضٍ مبني على الضم لاتصاله بواو الجماعة. وواو الجماعة: ضمير متصل مبني في محل رفع فاعل.",
      ),
    ).toBe("verb");
    expect(
      practiceOptionScope(
        "مصدر مؤول في محل رفع اسم الفعل الناسخ؛ لأنه تركيب من حرف مصدري وفعل مضارع ويؤول باسم.",
      ),
    ).toBe("role");
  });

  test("المضارع المعرب لا يولد الجر ويطابق الحكم بالعلامة", () => {
    const correct = "فعل مضارع مرفوع، وعلامة رفعه الضمة الظاهرة على آخره.";
    const options = buildPracticePolicyDistractors(correct, { ending: "sahih" });

    expect(options.length).toBe(2);
    expect(options.join(" ")).not.toContain("مجرور");
    expect(options.join(" ")).toContain("منصوب");
    expect(options.join(" ")).toContain("مجزوم");
    options.forEach(expectCoherentOption);

    const shortOptions = buildPracticePolicyDistractors("فعل مضارع مرفوع.", { ending: "sahih" });
    expect(shortOptions).toEqual(expect.arrayContaining(["فعل مضارع منصوب.", "فعل مضارع مجزوم."]));
    expect(shortOptions.join(" ")).not.toContain("علامة نصبه");
    expect(shortOptions.join(" ")).not.toContain("علامة جزمه");
  });

  test("المضارع المبني يحصل على بدائل فعلية متماسكة لا على خيار واحد", () => {
    const correct = "فعل مضارع مبني على السكون لاتصاله بنون النسوة.";
    const tawkid = "فعل مضارع مبني على الفتح لاتصاله بنون التوكيد.";
    const options = buildPracticePolicyDistractors(correct, { buildConnection: "niswa" });

    expect(practiceOptionScope(correct)).toBe("verb");
    expect(practiceOptionScope(tawkid)).toBe("verb");
    expect(options.length).toBe(2);
    expect(options.join(" ")).not.toContain("مجرور");
    expect(options).toContain(tawkid);
    options.forEach((option) => expect(practiceGrammarPolicyAllows(correct, option)).toBe(true));
  });

  test("شبه الجملة يفصل الجر الداخلي عن محل خبر الناسخ", () => {
    const correct = "شبه جملة من الجار والمجرور في محل نصب خبر كان مقدم.";
    const options = buildPracticePolicyDistractors(correct);
    const guidance = buildPracticePolicyGuidance({ resultText: correct, target: "في المنزل" });

    expect(options.length).toBe(2);
    expect(options.every((option) => option.includes("في محل نصب خبر كان"))).toBe(true);
    expect(guidance.level1.join(" ")).toMatch(/محله الإعرابي/u);
    expect(guidance.correction.join(" ")).toContain("خبر كان هنا في محل نصب");
    expect(guidance.correction.join(" ")).not.toMatch(/خبر كان.*مجرور/u);
  });

  test("اسم لا والمنقوص يستفيدان من السياسة نفسها بلا فروع في واجهة تدرب", () => {
    const la = "اسم «لا» النافية للجنس منصوب، وعلامة نصبه الياء لأنه مثنى، وهو مضاف.";
    const manqous = "اسم منقوص مجرور وعلامة جره الكسرة المقدرة على الياء منع من ظهورها الثقل، والياء ثابتة لأنه معرف بـ«الـ» أو مضاف.";

    const laOptions = buildPracticePolicyDistractors(la, { laWorks: true, isLaName: true, laNameKind: "mudaf", shape: "dual" });
    const manqousOptions = buildPracticePolicyDistractors(manqous, { case: "jar", yStatus: "kept", hasAl: true });
    const laGuidance = buildPracticePolicyGuidance({ resultText: la, target: "طالبَيِ", facts: { laWorks: true, isLaName: true, laNameKind: "mudaf", shape: "dual" } });
    const manqousGuidance = buildPracticePolicyGuidance({ resultText: manqous, target: "القاضي", facts: { case: "jar", yStatus: "kept", hasAl: true } });

    expect(laOptions.length).toBe(2);
    expect(manqousOptions.length).toBe(2);
    [...laOptions, ...manqousOptions].forEach(expectCoherentOption);
    expect(laGuidance.level2.join(" ")).toMatch(/اسمها.*مضاف.*مثنى.*علامة نصب/u);
    expect(laGuidance.level2.join(" ")).not.toContain("الياء");
    expect(manqousGuidance.level2.join(" ")).toMatch(/اسم منقوص.*مجرور.*الياء ثابتة.*هل تظهر حركة جر/u);
    expect(manqousGuidance.level2.join(" ")).not.toContain("الكسرة");
  });
});

test("سياسة التصنيف تقرأ تسمية القرار ووجهة الانتقال في جميع صيغ التوجيه", () => {
  const cases = [
    {
      text: "الكلمة الأولى فعل مضارع؛ ننتقل بعدها إلى مسار الفعل المضارع.",
      mustContain: ["فعل ماض", "فعل أمر"],
    },
    {
      text: "الكلمة الأولى فعل ماضٍ؛ الخطوة التالية تحديد علامة البناء.",
      mustContain: ["فعل مضارع", "فعل أمر"],
    },
    {
      text: "انتقل إلى خوارزمية إعراب الفعل المضارع.",
      mustContain: ["فعل ماض", "فعل أمر"],
    },
    {
      text: "ننتقل إلى مسار الفعل الماضي.",
      mustContain: ["فعل مضارع", "فعل أمر"],
    },
    {
      text: "انتقل إلى خوارزمية إعراب فعل الأمر.",
      mustContain: ["فعل مضارع", "فعل ماض"],
    },
  ];

  for (const item of cases) {
    expect(practiceOptionScope(item.text)).toBe("routing");

    const options = buildPracticePolicyDistractors(item.text);
    expect(options).toHaveLength(2);

    for (const expectedPart of item.mustContain) {
      expect(options.join(" ")).toContain(expectedPart);
    }

    expect(
      options.every((option) => practiceOptionScope(option) === "routing"),
    ).toBe(true);

    expect(
      options.every((option) =>
        practiceGrammarPolicyAllows(item.text, option),
      ),
    ).toBe(true);
  }

  const particle = "حرف مبني لا محل له من الإعراب، وبعده فعل.";
  expect(
    buildPracticePolicyDistractors(particle, {
      wordType: "particle",
      afterParticle: "verb",
    }),
  ).toEqual(["حرف مبني لا محل له من الإعراب، وبعده اسم."]);
});

test("PRACTICE_ALL_TOPICS_CONTRACT: جميع الموضوعات الجاهزة تمر بعقد تدرب الموحد", { timeout: 20000 }, async () => {
  const { TOPICS } = await import("../lib/topics");

  for (const topic of TOPICS.filter((item) => item.isReady)) {
    for (const example of topic.examples) {
      const label = `${topic.code} / ${String(example.id || example.target || "")}`;
      const state = buildRunnerState(topic.tree, "practice", example);
      const expected = practiceExpectedLabelFromRoute({
        tree: topic.tree,
        mode: "practice",
        example,
      });

      expect(expected, `${label}: نتيجة تدرب فارغة`).not.toBe("");

      const options = buildPracticeDirectOptions({
        tree: topic.tree,
        mode: "practice",
        example,
        state,
        practiceExpectedLabel: expected,
        topicId: topic.code,
      });

      expect(options.length, `${label}: خيارات تدرب غير كافية`).toBeGreaterThanOrEqual(2);
      expect(options.length, `${label}: خيارات تدرب أكثر من اللازم`).toBeLessThanOrEqual(3);
      expect(options, `${label}: النتيجة الصحيحة غير موجودة`).toContain(expected);

      const optionLengths = options.map((option) => option.length);
      const shortestOption = Math.max(1, Math.min(...optionLengths));
      const longestOption = Math.max(...optionLengths);
      expect(
        longestOption - shortestOption,
        `${label}: طول أحد الخيارات يكشف الإجابة بصريًا`,
      ).toBeLessThan(60);
      expect(
        longestOption / shortestOption,
        `${label}: تفاوت طول الخيارات كبير جدًا`,
      ).toBeLessThan(1.8);
      expect(new Set(options).size, `${label}: خيارات مكررة`).toBe(options.length);
      expect(new Set(options.map(practiceOptionScope)).size, `${label}: خلط بين مستويات الخيارات`).toBe(1);

      for (const option of options) {
        expectCoherentOption(option);
        if (normalized(option) !== normalized(expected)) {
          expect(practiceGrammarPolicyAllows(expected, option), `${label}: خيار يخالف السياسة النحوية`).toBe(true);
        }
        if (/فعل مضارع/u.test(expected) && practiceOptionScope(expected) === "verb") {
          expect(option, `${label}: الفعل المضارع لا يجر`).not.toMatch(/فعل مضارع[^.،]*مجرور/u);
        }
      }

      const hint1 = buildPracticeDirectHint({ tree: topic.tree, mode: "practice", state, topicId: topic.code }, 1);
      const hint2 = buildPracticeDirectHint({ tree: topic.tree, mode: "practice", state, topicId: topic.code }, 2);

      expect(hint1.trim(), `${label}: التلميح الأول فارغ`).not.toBe("");
      expect(hint2.trim(), `${label}: التلميح الثاني فارغ`).not.toBe("");
      if (String(example.target || "").trim()) {
        expect(
          normalized(hint1),
          `${label}: التلميح الأول غير مرتبط بالمثال المستهدف`,
        ).toContain(normalized(String(example.target || "")));
        expect(
          normalized(hint2),
          `${label}: التلميح الثاني غير مرتبط بالمثال المستهدف`,
        ).toContain(normalized(String(example.target || "")));
      }
      expect(hint1.split(/\r?\n/).filter(Boolean).length, `${label}: التلميح الأول طويل`).toBeLessThanOrEqual(2);
      expect(hint2.split(/\r?\n/).filter(Boolean).length, `${label}: التلميح الثاني طويل`).toBeLessThanOrEqual(3);
      expect(hint1).not.toMatch(/ثبتت هذه الخطوة|نبني هذه الخطوة|الإجابة الصحيحة هي|لذلك تكون الإجابة الصحيحة/u);
      expect(hint2).not.toMatch(/ثبتت هذه الخطوة|نبني هذه الخطوة|الإجابة الصحيحة هي|لذلك تكون الإجابة الصحيحة/u);
      expect(hint1).not.toMatch(/يوجد ناصب ولا جازم/u);
      expect(hint2).not.toMatch(/يوجد ناصب ولا جازم/u);
      expect(normalized(hint2), `${label}: التلميح الثاني يكرر الأول`).not.toBe(normalized(hint1));
      expect(`${hint1} ${hint2}`, `${label}: ظهر رمز برمجي للطالب`).not.toMatch(
        /\b(?:nasb|jazm|raf3|jarr|niswa|tawkid|alif2|yaa|sahih)\b/iu,
      );
      expect(`${hint1} ${hint2}`, `${label}: صياغة مولدة غير سليمة`).not.toMatch(
        /المفعول بهة|التمييزة|[،؛]?\s*ثم\s*$/u,
      );

      if (normalized(expected).length > 24) {
        expect(normalized(hint1), `${label}: التلميح الأول كشف النتيجة`).not.toContain(normalized(expected));
        expect(normalized(hint2), `${label}: التلميح الثاني كشف النتيجة`).not.toContain(normalized(expected));
      }

      const wrongOptions = options.filter(
        (option) => normalized(option) !== normalized(expected),
      );
      const correctionTexts: string[] = [];

      for (const wrongOption of wrongOptions) {
        const route = buildPracticeCorrectRoute({
          tree: topic.tree,
          mode: "practice",
          example,
          state,
          practiceExpectedLabel: expected,
          topicId: topic.code,
          wrongOption,
        });

        expect(route.steps.length, `${label}: لا توجد خطوات تصحيح`).toBeGreaterThan(0);
        expect(route.steps.length, `${label}: التصحيح أطول من اللازم`).toBeLessThanOrEqual(4);
        expect(route.steps.join(" ")).not.toMatch(/ثبتت هذه الخطوة|نبني هذه الخطوة|الإجابة الصحيحة هي|إذن:|يوجد ناصب ولا جازم/u);
        expect(route.steps.join(" "), `${label}: ظهر رمز برمجي في التصحيح`).not.toMatch(
          /\b(?:nasb|jazm|raf3|jarr|niswa|tawkid|alif2|yaa|sahih)\b/iu,
        );
        expect(route.steps.join(" "), `${label}: بقيت «ثم» معلقة بعد تنظيف التصحيح`).not.toMatch(
          /[،؛]?\s*ثم\s*$/u,
        );
        if (normalized(expected).length > 24) {
          expect(normalized(route.steps.join(" ")), `${label}: التصحيح كشف النتيجة`).not.toContain(normalized(expected));
        }
        expect(topic.tree.nodes[route.nextState.currentNodeId]?.type, `${label}: المسار لا يصل إلى نتيجة`).toBe("result");
        correctionTexts.push(normalized(route.steps.join(" ")));
      }

      if (correctionTexts.length >= 2) {
        expect(
          new Set(correctionTexts).size,
          `${label}: التصحيح لا يتفاعل مع الخيار الخاطئ المحدد`,
        ).toBe(1);
      }
    }
  }
});

test("تدرب يأخذ النتيجة من المسار الفعلي لا من أول نتيجة تشترك في مفتاح التغطية", async () => {
  const { TOPICS } = await import("../lib/topics");

  const present = TOPICS.find((item) => item.code === "present-verb");
  const inna = TOPICS.find((item) => item.code === "inna-wa-akhawatuha");
  expect(present).toBeDefined();
  expect(inna).toBeDefined();
  if (!present || !inna) return;

  const nisvaNasb = present.examples.find((item) => item.id === "pr-binaa-niswa-nasb");
  const nisvaJazm = present.examples.find((item) => item.id === "pr-binaa-niswa-jazm");
  const inna29 = inna.examples.find((item) => item.id === "in-29");
  expect(nisvaNasb).toBeDefined();
  expect(nisvaJazm).toBeDefined();
  expect(inna29).toBeDefined();
  if (!nisvaNasb || !nisvaJazm || !inna29) return;

  expect(
    practiceExpectedLabelFromRoute({ tree: present.tree, mode: "practice", example: nisvaNasb }),
  ).toContain("في محل نصب");
  expect(
    practiceExpectedLabelFromRoute({ tree: present.tree, mode: "practice", example: nisvaJazm }),
  ).toContain("في محل جزم");

  const innaResult = practiceExpectedLabelFromRoute({
    tree: inna.tree,
    mode: "practice",
    example: inna29,
  });
  expect(innaResult).toContain("خبر مرفوع");
  expect(innaResult).not.toContain("مبتدأ");
}, 15_000);

describe("وحدة الهدف في تدرب: كلمة أم جملة أم شبه جملة", { timeout: 20000 }, () => {
  test("خبر كان الجملة يحافظ على الإعراب الداخلي ويختبر محل الجملة كلها", async () => {
    const { TOPICS } = await import("../lib/topics");
    const { getExampleCoverageKeys } = await import("../lib/exercise/progress");
    const { practiceTargetUnit } = await import("../lib/exercise/practiceGrammarPolicy");

    const topic = TOPICS.find((item) => item.code === "kana-wa-akhawatuha");
    const example = topic?.examples.find((item) => item.id === "ka-10");
    expect(topic).toBeDefined();
    expect(example).toBeDefined();
    if (!topic || !example) return;

    expect(practiceTargetUnit(example.facts || {}, "")).toBe("verbal-sentence");

    const state = buildRunnerState(topic.tree, "practice", example);
    const coverage = getExampleCoverageKeys(example)[0] || "";
    const expected = practiceExpectedLabelForExample(
      safePracticeFinalLabel(topic.tree, example as QuizExampleLike, coverage),
      example,
    );
    const options = buildPracticeDirectOptions({
      tree: topic.tree,
      mode: "practice",
      example,
      state,
      practiceExpectedLabel: expected,
      topicId: topic.code,
    });

    expect(options.length).toBeGreaterThanOrEqual(2);
    expect(options).toContain(expected);
    expect(options.every((option) => /فعل مضارع/u.test(option))).toBe(true);
    expect(options.join(" ")).not.toMatch(/في محل (?:رفع|جر) خبر (?:الفعل الناسخ|كان)/u);
    expect(
      options.some((option) => /في محل رفع اسم (?:الفعل الناسخ|كان)|لا محل لها/u.test(option)),
    ).toBe(true);

    const first = buildPracticeDirectHint(
      { tree: topic.tree, mode: "practice", state, topicId: topic.code },
      1,
    );
    const second = buildPracticeDirectHint(
      { tree: topic.tree, mode: "practice", state, topicId: topic.code },
      2,
    );

    expect(first).toContain("جملة فعلية");
    expect(second).toContain("خبر");
    expect(first + second).not.toContain("مبني");

    const wrong = options.find((option) => /اسم (?:الفعل الناسخ|كان)|لا محل لها/u.test(option));
    expect(wrong).toBeDefined();
    const route = buildPracticeCorrectRoute({
      tree: topic.tree,
      mode: "practice",
      example,
      state,
      practiceExpectedLabel: expected,
      topicId: topic.code,
      wrongOption: wrong,
    });
    expect(route.steps.join(" ")).not.toContain("مبني");
    expect(route.steps.join(" ")).toMatch(/الجملة|التركيب/u);
  });

  test("الحال الجملة لا يتحول إلى سؤال عن بناء الفعل الداخلي", async () => {
    const { TOPICS } = await import("../lib/topics");
    const { getExampleCoverageKeys } = await import("../lib/exercise/progress");
    const topic = TOPICS.find((item) => item.code === "hal");
    const example = topic?.examples.find((item) => item.id === "hal-07");
    expect(topic).toBeDefined();
    expect(example).toBeDefined();
    if (!topic || !example) return;

    const state = buildRunnerState(topic.tree, "practice", example);
    const coverage = getExampleCoverageKeys(example)[0] || "";
    const expected = practiceExpectedLabelForExample(
      safePracticeFinalLabel(topic.tree, example as QuizExampleLike, coverage),
      example,
    );
    const options = buildPracticeDirectOptions({
      tree: topic.tree,
      mode: "practice",
      example,
      state,
      practiceExpectedLabel: expected,
      topicId: topic.code,
    });

    expect(options.every((option) => /فعل مضارع مرفوع/u.test(option))).toBe(true);
    expect(options.join(" ")).not.toMatch(/فعل مضارع (?:منصوب|مجزوم|مبني)/u);

    const first = buildPracticeDirectHint(
      { tree: topic.tree, mode: "practice", state, topicId: topic.code },
      1,
    );
    const second = buildPracticeDirectHint(
      { tree: topic.tree, mode: "practice", state, topicId: topic.code },
      2,
    );
    expect(first + second).toMatch(/الحال|هيئة/u);
    expect(first + second).not.toContain("مبني");
  });

  test("النعت الجملة يتعامل مع التركيب كله ويتبع محل المتبوع", async () => {
    const { TOPICS } = await import("../lib/topics");
    const topic = TOPICS.find((item) => item.code === "tawabi");
    const example = topic?.examples.find((item) => item.id === "tw-19");
    expect(topic).toBeDefined();
    expect(example).toBeDefined();
    if (!topic || !example) return;

    const state = buildRunnerState(topic.tree, "practice", example);
    const first = buildPracticeDirectHint(
      { tree: topic.tree, mode: "practice", state, topicId: topic.code },
      1,
    );
    const second = buildPracticeDirectHint(
      { tree: topic.tree, mode: "practice", state, topicId: topic.code },
      2,
    );

    expect(first).toMatch(/الجملة الفعلية|الاسم الذي قبلها/u);
    expect(second).toContain("نعت");
    expect(second).toMatch(/محل|المتبوع/u);
    expect(first + second).not.toContain("مبني");
  });
});
