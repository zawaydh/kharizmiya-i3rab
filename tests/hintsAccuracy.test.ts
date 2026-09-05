import { describe, expect, test } from "vitest";
import { firstLevelHintText } from "../lib/hintText";
import { nonRevealingWrongChoiceHint, studentHintText } from "../app/components/exercise/ExercisePedagogy";
import { customTawabiPedagogyNode } from "../app/components/exercise/TawabiStudentHints";
import { cleanKanaTree } from "../content/trees/clean_kana";
import { firstWordTree } from "../content/trees/first_word";
import { presentVerbTree } from "../content/trees/verb_present";
import { pastVerbTree } from "../content/trees/verb_past";
import { imperativeVerbTree } from "../content/trees/verb_imperative";
import { ismManqousTree } from "../content/trees/ism_manqous";
import {
  tawabiTree,
  tawabiNaatTree,
  tawabiAtfTree,
  tawabiTawkidTree,
  tawabiBadalTree,
} from "../content/trees/tawabi";
import { faelTree } from "../content/trees/fael";
import startExamples from "../data/interactive_examples.json";
import type { QuestionNode } from "../lib/exercise/model";

describe("دقة التلميحات وارتباطها بالعقد", () => {
  test("يفحص اسم كان في الجملة كلها ولا يحكم من الكلمة التالية فقط", () => {
    const text = firstLevelHintText("kana_hidden_ism_site", "", "هو", "هل ظهر اسم صريح؟");
    expect(text).toContain("الجملة كلها");
    expect(text).toContain("خبر مقدم");
    expect(text).not.toContain("مباشرة");

    const node = cleanKanaTree.nodes.kana_hidden_ism_site as QuestionNode;
    expect(node.hint).toContain("كان في البيت رجلٌ");
    expect(node.answers[0].hint).toContain("حتى نهاية الجملة");
  });

  test("يخصص تلميح خبر كان لصورة الخبر", () => {
    const text = firstLevelHintText("kana_khabar_entry", "", "في البيت", "ما صورة خبر الفعل الناسخ؟");
    expect(text).toContain("خبر مفرد");
    expect(text).toContain("جملة اسمية");
    expect(text).toContain("جملة فعلية");
    expect(text).toContain("شبه جملة");
    expect(text).not.toContain("ما الدور الذي أدته");
  });

  test("يذكر جميع متصلات فعل الأمر الموجودة في العقدة", () => {
    const text = firstLevelHintText("imperative_attached_kind", "", "اكتبا", "ما نوع المتصل؟");
    for (const part of ["نون النسوة", "نون التوكيد", "ألف الاثنين", "واو الجماعة", "ياء المخاطبة"]) {
      expect(text).toContain(part);
    }
    expect(imperativeVerbTree.nodes.imperative_attached_kind.answers).toHaveLength(5);
  });


  test("يخصص تلميح حرف العلة المحذوف وتصحيحه للنقرة في فعل الأمر", () => {
    const firstHint = firstLevelHintText("imperative_weak_letter", "", "ادعُ", "ما حرف العلة المحذوف؟");
    expect(firstHint).toContain("هو يدعو");
    expect(firstHint).not.toContain("المحذوف هو الواو");

    const node = imperativeVerbTree.nodes.imperative_weak_letter;
    expect(node?.type).toBe("question");
    if (!node || node.type !== "question") {
      throw new Error("عقدة حرف العلة في فعل الأمر ليست عقدة سؤال");
    }

    const cases = [
      { target: "ادعُ", presentBase: "يدعو", weakLetter: "waw", wrong: "الألف", expected: "الواو" },
      { target: "ارمِ", presentBase: "يرمي", weakLetter: "ya", wrong: "الواو", expected: "الياء" },
      { target: "اسعَ", presentBase: "يسعى", weakLetter: "alif", wrong: "الياء", expected: "الألف" },
    ] as const;

    for (const item of cases) {
      const picked = node.answers.find((answer) => answer.text === item.wrong);
      expect(picked, `خيار ${item.wrong} غير موجود في عقدة حرف العلة`).toBeTruthy();
      const text = studentHintText(node, picked, {
        currentTarget: item.target,
        facts: { weakLetter: item.weakLetter, presentBase: item.presentBase },
      });
      expect(text).toContain(`اخترتَ ${item.wrong}`);
      expect(text).toContain(`هو «${item.presentBase}»`);
      expect(text).toContain(`الحرف المحذوف هو ${item.expected}`);
    }
  });

  test("لا يعرض تلميح الصورة خيارات من خارج العقدة", () => {
    const text = firstLevelHintText("fael_mu3rab_shape", "", "المعلمان", "ما صورة الفاعل؟");
    expect(text).toContain("مفرد");
    expect(text).toContain("مثنى");
    expect(text).toContain("جمع تكسير");
    expect(text).toContain("الأسماء الخمسة");
    expect(text).not.toContain("اسم مبني");
    expect(text).not.toContain("تركيب");
  });

  test("لا يقطع تلميح اسم إن ولا تلميح نوع المبتدأ", () => {
    const inna = firstLevelHintText("inna_ism_start", "", "الطالبَ", "ما طبيعة اسم الحرف الناسخ؟");
    expect(inna).toContain("اسم معرب");
    expect(inna).toContain("ضمير متصل");
    expect(inna).toContain("اسم مبني");
    expect(inna).toContain("يؤول بمصدر");
    expect(inna).not.toContain("…");

    const mubtada = firstLevelHintText("mubtada_word_type", "", "العلم", "ما نوع الكلمة؟");
    expect(mubtada).toContain("اسم أو في معنى الاسم");
    expect(mubtada).toContain("فعل");
    expect(mubtada).toContain("حرف");
    expect(mubtada).not.toContain("…");
  });


  test("لا يعيد التلميح السؤال بل يضيف أداة تفكير", () => {
    const fael = firstLevelHintText("fael_role_verbal", "", "المعلمون", "من الذي قام بالفعل؟");
    expect(fael).toContain("أُسنِد إليه الحدث");
    expect(fael).toContain("ضمير");
    expect(fael).not.toBe("من الذي قام بالفعل؟");

    const mafool = firstLevelHintText("mafool_role", "", "الدرس", "على من أو على ماذا وقع الفعل؟");
    expect(mafool).toContain("الفاعل قام بالحدث");
    expect(mafool).toContain("وقع عليه أثر الفعل");

    const hal = firstLevelHintText("hal_relation", "", "في هدوء", "كيف جاء الضيف؟");
    expect(hal).toContain("وهو/وهي");
    expect(hal).toContain("هادئًا");

    const munada = firstLevelHintText("munada_tool", "", "طالب", "هل سبقه نداء؟");
    expect(munada).toContain("من الذي يخاطبه المتكلم مباشرة");
  });

  test("يستخدم تلميح العقدة التفصيلي في العلامة والحالة بدل عبارة عامة", () => {
    const mark = firstLevelHintText("naib_mark", "ثبت أن «الكتاب» نائب فاعل مرفوع، وهو اسم مفرد صحيح الآخر. علامة رفع المفرد الضمة.", "الكتاب", "ما علامة الرفع؟");
    expect(mark).toContain("نائب فاعل مرفوع");
    expect(mark).toContain("المفرد");
    expect(mark).not.toContain("ما العلامة التي تناسبهما");
  });


  test("يجعل التلميح الأول قرينة من المثال لا إعادة للسؤال أو كشفًا آليًا للعلامة", () => {
    const firstWord = studentHintText(firstWordTree.nodes.fw_decision_1 as QuestionNode, undefined, {
      currentTarget: "العلمُ",
      currentSentence: "العلمُ نورٌ.",
      facts: { wordType: "noun" },
    });
    expect(firstWord).toContain("«الـ»");
    expect(firstWord).toContain("العلمُ");
    expect(firstWord).not.toContain("أهي اسم");

    const weak = studentHintText(presentVerbTree.nodes.present_raf3_weak_letter as QuestionNode, undefined, {
      currentTarget: "يسعى",
      currentSentence: "يسعى الطالبُ إلى النجاحِ.",
      facts: { weakLetter: "alif" },
    });
    expect(weak).toContain("هو يسعى");
    expect(weak).not.toContain("اخترتَ «»");
    expect(weak).not.toContain("الحرف المطلوب هو الألف");

    const faelShape = studentHintText(faelTree.nodes.fael_mu3rab_shape as QuestionNode, undefined, {
      currentTarget: "الوالدانِ",
      currentSentence: "حضرَ الوالدانِ الاجتماعَ.",
      facts: { shape: "dual", raf3Mark: "alif", roleKind: "visible" },
    });
    expect(faelShape).toContain("تدل على اثنين");
    expect(faelShape).not.toContain("علامة رفع المثنى الألف");
  });


  test("لا يحول التلميح بعد الخطأ إلى كشف مباشر للإجابة الصحيحة", () => {
    const node = faelTree.nodes.fael_mu3rab_shape as QuestionNode;
    const picked = node.answers.find((answer) => answer.text === "مفرد");
    expect(picked).toBeTruthy();
    if (!picked) throw new Error("خيار المفرد غير موجود في عقدة صورة الفاعل");

    const hint = nonRevealingWrongChoiceHint(
      node,
      picked,
      {
        currentTarget: "الوالدانِ",
        currentSentence: "حضرَ الوالدانِ الاجتماعَ.",
        facts: { shape: "dual", raf3Mark: "alif", roleKind: "visible" },
      },
      "الصورة الصحيحة هي مثنى، وعلامة رفع المثنى الألف.",
    );
    expect(hint).toContain("اختيار «مفرد»");
    expect(hint).toContain("تدل على اثنين");
    expect(hint).not.toContain("الصورة الصحيحة");
    expect(hint).not.toContain("علامة رفع المثنى الألف");
  });

  test("يربط تلميح الحرف بما بعده", () => {
    const hint = firstWordTree.nodes.fw_particle_after.hint;
    expect(hint).toContain("الكلمة التي جاءت بعد الحرف");
    expect(hint).toContain("حدث وزمن");
    expect(hint).not.toBe("الحرف يوجّه ما بعده.");
  });

  test("يتعامل مع أدوات المضارع المتصلة بحرف عطف أو استئناف", () => {
    const hint = presentVerbTree.nodes.present_tool_presence.hint;
    expect(hint).toContain("فلن");
    expect(hint).toContain("ولم");
  });

  test("لا يعتمد اتصال الماضي على زيادة طول الكلمة", () => {
    const hint = pastVerbTree.nodes.past_has_attachment.hint;
    expect(hint).toContain("لا تعتمد على طول الكلمة");
    expect(hint).toContain("نون النسوة");
  });

  test("يحافظ على ترتيب الاسم المنقوص: أل ثم الإضافة ثم الحالة", () => {
    expect(ismManqousTree.startNodeId).toBe("manqous_identity");
    const al = ismManqousTree.nodes.manqous_has_al as QuestionNode;
    const added = ismManqousTree.nodes.manqous_is_added as QuestionNode;
    const indef = ismManqousTree.nodes.manqous_indef_case as QuestionNode;
    expect(al.text).toContain("معرّف بـ«الـ»");
    expect(added.text).toContain("مضاف");
    expect(indef.hint).toContain("في النصب تثبت الياء");
    expect(indef.hint).toContain("الرفع والجر فتحذف الياء");
  });

  test("يفصل القرار الأول في التوابع عن التصنيف الفرعي والحالة", () => {
    expect(tawabiNaatTree.practiceStartNodeId).toBe("tawabi_naat_discovery");
    expect(tawabiAtfTree.practiceStartNodeId).toBe("tawabi_atf_discovery");
    expect(tawabiTawkidTree.practiceStartNodeId).toBe("tawabi_tawkid_discovery");
    expect(tawabiBadalTree.practiceStartNodeId).toBe("tawabi_badal_discovery");

    for (const tree of [tawabiNaatTree, tawabiAtfTree, tawabiTawkidTree, tawabiBadalTree]) {
      const opening = tree.nodes[tree.startNodeId] as QuestionNode;
      expect(opening.answers).toHaveLength(4);
      const labels = opening.answers.map((answer) => answer.text).join(" | ");
      expect(labels).toMatch(/تصف|صفة/u);
      expect(labels).toMatch(/توكيد|يكرر/u);
      expect(labels).toMatch(/حرف عطف/u);
      expect(labels).toMatch(/المقصود بالحكم/u);
    }

    const naatKind = tawabiNaatTree.nodes.tawabi_naat_kind as QuestionNode;
    expect(new Set(
      naatKind.answers.map((answer) => String(answer.eval?.equals || "")).filter(Boolean),
    )).toEqual(new Set(["mu3rab", "sentence", "shibh"]));

    const tawkidKind = tawabiTawkidTree.nodes.tawabi_tawkid_kind as QuestionNode;
    expect(new Set(
      tawkidKind.answers.map((answer) => String(answer.eval?.equals || "")).filter(Boolean),
    )).toEqual(new Set(["lafzi", "manawi"]));
    const tawkidKindText = `${tawkidKind.hint} ${tawkidKind.answers.map((answer) => `${answer.text} ${answer.hint || ""}`).join(" ")}`;
    for (const word of ["نفس", "عين", "كل", "جميع", "عامة", "كلا", "كلتا"]) {
      expect(tawkidKindText).toContain(word);
    }
    expect(tawkidKindText).toContain("ضمير");

    const badalKind = tawabiBadalTree.nodes.tawabi_badal_kind as QuestionNode;
    expect(new Set(
      badalKind.answers.map((answer) => String(answer.eval?.equals || "")).filter(Boolean),
    )).toEqual(new Set(["مطابق", "بعض من كل", "اشتمال"]));
  });

  test("يعوض زر أحتاج تلميح اختصار التوابع بقرينة موجهة من المثال", () => {
    const badal = tawabiBadalTree.nodes.tawabi_badal_discovery as QuestionNode;
    const help = studentHintText(badal, undefined, {
      currentTarget: "نصفه",
      facts: {
        tawabiTerm: "badal",
        relationKind: "substitution",
        badalKind: "بعض من كل",
        matbu3: "الرغيف",
        matbu3Role: "مفعول به منصوب",
        case: "nasb",
      },
    });
    expect(help).toContain("جزء");
    expect(help).toContain("حقيقي");
    expect(help).toContain("الرغيف");

    const badalKindNode = tawabiBadalTree.nodes.tawabi_badal_kind as QuestionNode;
    const wrongMatched = badalKindNode.answers.find((answer) =>
      answer.text.includes("مطابق"),
    );
    expect(wrongMatched).toBeTruthy();
    const correction = studentHintText(badalKindNode, wrongMatched, {
      currentTarget: "نصفه",
      facts: {
        tawabiTerm: "badal",
        relationKind: "substitution",
        badalKind: "بعض من كل",
        matbu3: "الرغيف",
        matbu3Role: "مفعول به منصوب",
        case: "nasb",
      },
    });
    expect(correction).toContain("البدل المطابق");
    expect(correction).toContain("جزء");

    const tawkid = tawabiTawkidTree.nodes.tawabi_tawkid_discovery as QuestionNode;
    const tawkidHelp = studentHintText(tawkid, undefined, {
      currentTarget: "نفسه",
      facts: {
        tawabiTerm: "tawkid",
        relationKind: "emphasis",
        tawkidKind: "manawi",
        matbu3: "المدير",
        matbu3Role: "فاعل مرفوع",
        case: "raf3",
      },
    });
    expect(tawkidHelp).toContain("نفس");
    expect(tawkidHelp).toContain("ضمير");
  });

  test("السؤال الأول في كل تابع يعلّم تمييزه من بقية التوابع", () => {
    const branches = [tawabiNaatTree, tawabiAtfTree, tawabiTawkidTree, tawabiBadalTree];
    for (const tree of branches) {
      const node = tree.nodes[tree.startNodeId] as QuestionNode;
      const text = node.answers.map((answer) => answer.text).join(" | ");
      expect(node.text).toContain("أي قرينة");
      expect(text).toMatch(/تصف|صفة/u);
      expect(text).toMatch(/حرف عطف/u);
      expect(text).toMatch(/تكرر|توكيد/u);
      expect(text).toMatch(/المقصود بالحكم/u);
    }
  });

  test("تلميحات التوابع تحمل مفاتيح قصيرة وتطبيقًا على المثال", () => {
    const naat = studentHintText(tawabiNaatTree.nodes.tawabi_naat_discovery as QuestionNode, undefined, {
      currentTarget: "فوق الشجرة",
      facts: { tawabiTerm: "naat", roleKind: "shibh", matbu3: "طائرًا", matbu3Role: "مفعول به منصوب", case: "nasb" },
    });
    expect(naat).toContain("شبه الجملة بعد النكرة");
    expect(naat).toContain("صفة");

    const atf = studentHintText(tawabiAtfTree.nodes.tawabi_atf_discovery as QuestionNode, undefined, {
      currentTarget: "سليم",
      facts: { tawabiTerm: "atf", connector: "الواو", matbu3: "خالد", matbu3Role: "فاعل مرفوع", case: "raf3" },
    });
    expect(atf).toContain("حرف عطف");
    expect(atf).toContain("يتبع");

    const badal = studentHintText(tawabiBadalTree.nodes.tawabi_badal_discovery as QuestionNode, undefined, {
      currentTarget: "نصفه",
      facts: { tawabiTerm: "badal", badalKind: "بعض من كل", matbu3: "الرغيف", matbu3Role: "مفعول به منصوب", case: "nasb" },
    });
    expect(badal).toContain("المقصود بالحكم");
    expect(badal).toContain("تمهيد");
    expect(badal).toContain("جزء");
  });
  test("يفصل في العطف بين اكتشاف حرف العطف وتحديد الحالة الإعرابية", () => {
    const discovery = customTawabiPedagogyNode(
      tawabiAtfTree.nodes.tawabi_atf_discovery as QuestionNode,
      {
        currentTarget: "المأموم",
        facts: {
          tawabiTerm: "atf",
          relationKind: "coordination",
          connector: "الفاء",
          matbu3: "الإمام",
          matbu3Role: "فاعل مرفوع",
          case: "raf3",
          roleKind: "mu3rab",
        },
      },
    );

    expect(discovery?.hint).toContain("الواو، الفاء، ثم، أو، أم، بل، لا، لكن، حتى");
    expect(discovery?.hint).toContain("حرف عطف");
    expect(discovery?.hint).toContain("(الفاء)");
    const correct = discovery?.answers.find((answer) => answer.id === "relation_coordination");
    expect(correct?.text).toContain("حرف عطف");
    expect(correct?.text).not.toContain("الرفع");
    expect(correct?.next).toBe("tawabi_case");

    const caseNode = customTawabiPedagogyNode(
      tawabiAtfTree.nodes.tawabi_case as QuestionNode,
      {
        currentTarget: "المأموم",
        facts: {
          tawabiTerm: "atf",
          relationKind: "coordination",
          connector: "الفاء",
          matbu3: "الإمام",
          matbu3Role: "فاعل مرفوع",
          case: "raf3",
          roleKind: "mu3rab",
        },
      },
    );

    expect(caseNode?.text).toContain("التابع (المأموم) جاء بعد حرف العطف (الفاء)");
    expect(caseNode?.text).toContain("معطوف على (الإمام)");
    expect(caseNode?.text).toContain("المعطوف يتبع المعطوف عليه في الحالة الإعرابية");
    expect(caseNode?.text).toContain("(الإمام) فاعل مرفوع");
    expect(caseNode?.text).toContain("فما الحالة الإعرابية للتابع (المأموم)");
  });
  test("يميّز النعت الجملة بعد النكرة ويذكر الرابط", () => {
    const node = customTawabiPedagogyNode(
      tawabiNaatTree.nodes.tawabi_naat_discovery as QuestionNode,
      {
        currentTarget: "أخلاقه حسنة",
        facts: {
          tawabiTerm: "naat",
          roleKind: "sentence",
          relationKind: "description",
          case: "raf3",
          matbu3: "طالب",
          matbu3Role: "خبر مرفوع",
          phraseKind: "جملة اسمية",
          linkText: "الهاء في (أخلاقه) تعود على الطالب",
        },
      },
    );
    expect(node?.hint).toContain("نكرة");
    expect(node?.hint).toContain("بعد النكرات صفات غالبًا");
    expect(node?.hint).toContain("بعد المعارف");
    expect(node?.hint).toContain("أحوال");
    expect(node?.hint).toContain("الهاء في (أخلاقه) تعود على الطالب");
  });

  test("يجعل إعراب النعت الجملة وشبه الجملة بالمحل لا بالحركة", () => {
    const samples = [
      { roleKind: "sentence", target: "أخلاقه حسنة", matbu3: "طالب", matbu3Role: "خبر مرفوع", phraseKind: "جملة اسمية", case: "raf3", expected: "في محل رفع نعت" },
      { roleKind: "shibh", target: "فوق الشجرة", matbu3: "طائرًا", matbu3Role: "مفعول به منصوب", phraseKind: "شبه جملة ظرفية", case: "nasb", expected: "في محل نصب نعت" },
    ];
    for (const sample of samples) {
      const node = customTawabiPedagogyNode(
        tawabiNaatTree.nodes.tawabi_case as QuestionNode,
        {
          currentTarget: sample.target,
          facts: {
            tawabiTerm: "naat",
            roleKind: sample.roleKind,
            relationKind: "description",
            case: sample.case,
            matbu3: sample.matbu3,
            matbu3Role: sample.matbu3Role,
            phraseKind: sample.phraseKind,
          },
        },
      );
      expect(node?.text).toContain("فما محل");
      expect(node?.answers.map((answer) => answer.text)).toContain(sample.expected);
      expect(node?.hint).toContain("نحدد محلها من إعراب المنعوت");
    }
  });
  test("يربط سؤال حالة البدل بالمقصود بالحكم ثم بالمبدل منه", () => {
    const node = customTawabiPedagogyNode(
      tawabiBadalTree.nodes.tawabi_case as QuestionNode,
      {
        currentTarget: "أسلوبه",
        facts: {
          tawabiTerm: "badal",
          matbu3: "الشاعر",
          matbu3Role: "فاعل مرفوع",
          case: "raf3",
          roleKind: "mu3rab",
        },
      },
    );

    expect(node?.text).toContain("التابع (أسلوبه) هو المقصود بالحكم");
    expect(node?.text).toContain("المتبوع (الشاعر) تمهيد له");
    expect(node?.text).toContain("يمكن غالبًا حذفه");
    expect(node?.text).toContain("البدل يتبع المبدل منه في الحالة الإعرابية");
    expect(node?.text).toContain("(الشاعر) فاعل مرفوع");
    expect(node?.text).toContain("فما الحالة الإعرابية للتابع (أسلوبه)");
  });
  test("يقيد قاعدة الإحلال بالبدل المطابق", () => {
    const hint = tawabiTree.nodes.tawabi_relation.hint;
    expect(hint).toContain("البدل المطابق");
    expect(hint).toContain("بدل البعض والاشتمال");
  });

  test("يعطي مثال فعل الأمر في البداية دليلاً على السكون", () => {
    const example = (startExamples as any[]).find((item) => item.id === "imperative");
    const step = example.steps.find((item: any) => item.id === "build");
    expect(step.hint).toContain("لم يتصل");
    expect(step.hint).toContain("حرف صحيح");
    expect(step.hint).not.toContain("اختر العلامة الناتجة عن المسار");
  });
});

describe("تنظيف الفروع غير المدعومة", () => {
  test("لا يقدّم الضمير المنفصل بوصفه اسمًا قياسيًا لإن", async () => {
    const { cleanInnaTree } = await import("../content/trees/clean_inna");
    const rawAnswers = cleanInnaTree.nodes.inna_ism_built.answers;
    const choices = Array.isArray(rawAnswers)
      ? rawAnswers.map((answer) =>
          typeof answer === "object" && answer !== null && "text" in answer
            ? String(answer.text)
            : "",
        )
      : [];
    expect(choices).not.toContain("ضمير منفصل");
    expect(cleanInnaTree.nodes.R_inna_ism_damir).toBeUndefined();
  });
});
