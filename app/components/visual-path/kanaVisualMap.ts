import { addFactOptions, addResult, addStart } from "./visualMapBuilders";
import type { Example, VisualEdge, VisualMap, VisualNode } from "./types";

export function buildKanaVisualMap(example: Example | null): VisualMap {
  const nodes: VisualNode[] = [];
  const edges: VisualEdge[] = [];
  const rawTarget = String(example?.target || "").trim();
  const attachedTarget = rawTarget.match(/^(.+) في \((.+)\)$/u);
  const target = attachedTarget ? `«${attachedTarget[1]}» في «${attachedTarget[2]}»` : rawTarget ? `«${rawTarget}»` : "الكلمة";

  addFactOptions(nodes, edges, {
    id: "kana:role",
    text: `ما الوظيفة الإعرابية لـ${target}؟`,
    hint: "اسم الناسخ مرفوع أو في محل رفع، وخبره منصوب أو في محل نصب، وقد يكون اسم الناسخ ضميرًا مستترًا.",
    choices: [
      { id: "ism", label: "اسم الناسخ", target: "kana:ism:kind", test: { fact: "targetRole", equals: "ism" } },
      { id: "khabar", label: "خبر الناسخ", target: "kana:khabar:kind", test: { fact: "targetRole", equals: "khabar" } },
      { id: "hidden", label: "اسم مستتر", target: "kana:result:ism:hidden", test: { fact: "targetRole", equals: "hidden_ism" } },
    ],
  });
  addFactOptions(nodes, edges, {
    id: "kana:ism:kind",
    text: `ما طبيعة اسم الناسخ ${target}؟`,
    hint: "الاسم المبني يُذكر بناؤه ومحله، والمصدر المؤول يكون في محل رفع، والاسم المعرب تظهر عليه علامة الرفع أو تُقدّر.",
    choices: [
      { id: "mabni", label: "اسم مبني", target: "kana:ism:mabni-type", test: { fact: "nounKind", equals: "mabni" } },
      { id: "masdar", label: "مصدر مؤول", target: "kana:result:ism:masdar", test: { fact: "nounKind", equals: "masdar" } },
      { id: "mu3rab", label: "اسم معرب", target: "kana:ism:form", test: { fact: "nounKind", equals: "mu3rab" } },
    ],
  });
  addFactOptions(nodes, edges, {
    id: "kana:ism:mabni-type",
    text: `ما نوع الاسم المبني ${target}؟`,
    hint: "ميّز بين الضمير واسم الإشارة والاسم الموصول من لفظ المثال نفسه.",
    choices: [
      { id: "damir", label: "ضمير", target: "kana:result:ism:damir", test: { fact: "mabniType", equals: "damir" } },
      { id: "ishara", label: "اسم إشارة", target: "kana:result:ism:ishara", test: { fact: "mabniType", equals: "ishara" } },
      { id: "mawsool", label: "اسم موصول", target: "kana:result:ism:mawsool", test: { fact: "mabniType", equals: "mawsool" } },
    ],
  });
  addFactOptions(nodes, edges, {
    id: "kana:ism:form",
    text: `ما صورة اسم الناسخ المعرب ${target}؟`,
    hint: "صورة الاسم تحدد علامة الرفع: الألف للمثنى، والواو لجمع المذكر السالم والأسماء الخمسة، والضمة فيما عدا ذلك مع مراعاة التقدير.",
    choices: [
      { id: "dual", label: "مثنى", target: "kana:result:ism:dual", test: { fact: "number", equals: "dual" } },
      { id: "jms", label: "جمع مذكر سالم", target: "kana:result:ism:jms", test: { fact: "number", equals: "jms" } },
      { id: "five", label: "من الأسماء الخمسة", target: "kana:result:ism:five", test: { fact: "number", equals: "five" } },
      { id: "jfs", label: "جمع مؤنث سالم", target: "kana:result:ism:jfs", test: { fact: "number", equals: "jfs" } },
      { id: "attached-ya", label: "متصل بياء المتكلم", target: "kana:result:ism:attached-ya", test: { fact: "ending", equals: "attached_ya" } },
      { id: "estimated", label: "معتل بالألف", target: "kana:result:ism:estimated", test: { fact: "ending", equals: "moatal" } },
      { id: "visible", label: "صحيح الآخر", target: "kana:result:ism:visible", test: { fact: "ending", equals: "sahih" } },
    ],
  });

  addFactOptions(nodes, edges, {
    id: "kana:khabar:kind",
    text: `ما نوع خبر الناسخ ${target}؟`,
    hint: "الخبر المفرد ما ليس جملة ولا شبه جملة، ولو كان مثنى أو جمعًا.",
    choices: [
      { id: "single", label: "خبر مفرد", target: "kana:khabar:single-form", test: { fact: "khabarKind", equals: "single" } },
      { id: "sentence", label: "جملة", target: "kana:khabar:sentence", test: { fact: "khabarKind", equals: "sentence" } },
      { id: "shibh", label: "شبه جملة", target: "kana:khabar:shibh", test: { fact: "khabarKind", equals: "shibh" } },
    ],
  });
  addFactOptions(nodes, edges, {
    id: "kana:khabar:sentence",
    text: `ما نوع الجملة الواقعة خبرًا ${target}؟`,
    hint: "الجملة الفعلية تبدأ بفعل، والجملة الاسمية تبدأ باسم.",
    choices: [
      { id: "verbal", label: "جملة فعلية", target: "kana:result:khabar:verbal", test: { fact: "sentenceType", equals: "verbal" } },
      { id: "nominal", label: "جملة اسمية", target: "kana:result:khabar:nominal", test: { fact: "sentenceType", equals: "nominal" } },
    ],
  });
  addFactOptions(nodes, edges, {
    id: "kana:khabar:shibh",
    text: `ما نوع شبه الجملة الواقعة خبرًا ${target}؟`,
    hint: "الجار والمجرور يبدأ بحرف جر، والظرف يدل على زمان أو مكان.",
    choices: [
      { id: "jar", label: "جار ومجرور", target: "kana:khabar:jar-position", test: { fact: "shibhType", equals: "jar" } },
      { id: "zarf", label: "ظرف", target: "kana:khabar:zarf-position", test: { fact: "shibhType", equals: "zarf" } },
    ],
  });
  addFactOptions(nodes, edges, {
    id: "kana:khabar:jar-position",
    text: `ما موقع الجار والمجرور ${target} بالنسبة إلى اسم الناسخ؟`,
    hint: "إذا تقدّم شبه الجملة على اسم الناسخ النكرة فهو خبر مقدم، والاسم بعده اسم الناسخ مؤخر.",
    choices: [
      { id: "advanced", label: "خبر مقدم", target: "kana:result:khabar:jar-advanced", test: { fact: "shibhPosition", equals: "advanced" } },
      { id: "normal", label: "خبر غير مقدم", target: "kana:result:khabar:jar", test: { fact: "shibhPosition", notEquals: "advanced" } },
    ],
  });
  addFactOptions(nodes, edges, {
    id: "kana:khabar:zarf-position",
    text: `ما موقع الظرف ${target} بالنسبة إلى اسم الناسخ؟`,
    hint: "إذا تقدّم الظرف على اسم الناسخ النكرة فهو خبر مقدم، والاسم بعده اسم الناسخ مؤخر.",
    choices: [
      { id: "advanced", label: "خبر مقدم", target: "kana:result:khabar:zarf-advanced", test: { fact: "shibhPosition", equals: "advanced" } },
      { id: "normal", label: "خبر غير مقدم", target: "kana:result:khabar:zarf", test: { fact: "shibhPosition", notEquals: "advanced" } },
    ],
  });
  addFactOptions(nodes, edges, {
    id: "kana:khabar:single-form",
    text: `ما صورة الخبر المفرد ${target}؟`,
    hint: "صورة الاسم تحدد علامة النصب أو المحل الإعرابي.",
    choices: [
      { id: "masdar", label: "مصدر مؤول", target: "kana:result:khabar:masdar", test: { fact: "nounKind", equals: "masdar" } },
      { id: "dual", label: "مثنى", target: "kana:result:khabar:dual", test: { fact: "number", equals: "dual" } },
      { id: "jms", label: "جمع مذكر سالم", target: "kana:result:khabar:jms", test: { fact: "number", equals: "jms" } },
      { id: "five", label: "من الأسماء الخمسة", target: "kana:result:khabar:five", test: { fact: "number", equals: "five" } },
      { id: "jfs", label: "جمع مؤنث سالم", target: "kana:result:khabar:jfs", test: { fact: "number", equals: "jfs" } },
      { id: "estimated", label: "معتل بالألف", target: "kana:result:khabar:estimated", test: { fact: "ending", equals: "moatal" } },
      { id: "visible", label: "صحيح الآخر", target: "kana:result:khabar:visible", test: { fact: "ending", equals: "sahih" } },
    ],
  });

  addResult(nodes, "kana:result:ism:hidden", "ضمير مستتر\nفي محل رفع اسم الناسخ", "اسم الفعل الناسخ ضمير مستتر يعود على الاسم السابق في الجملة.");
  addResult(nodes, "kana:result:ism:damir", "ضمير مبني\nفي محل رفع اسم الناسخ", "ضمير متصل مبني في محل رفع اسم الفعل الناسخ.");
  addResult(nodes, "kana:result:ism:ishara", "اسم إشارة مبني\nفي محل رفع اسم الناسخ", "اسم إشارة مبني في محل رفع اسم الفعل الناسخ.");
  addResult(nodes, "kana:result:ism:mawsool", "اسم موصول مبني\nفي محل رفع اسم الناسخ", "اسم موصول مبني في محل رفع اسم الفعل الناسخ.");
  addResult(nodes, "kana:result:ism:masdar", "مصدر مؤول\nفي محل رفع اسم الناسخ", "مصدر مؤول في محل رفع اسم الفعل الناسخ.");
  addResult(nodes, "kana:result:ism:dual", "اسم الناسخ مرفوع\nوعلامة رفعه الألف", "اسم الفعل الناسخ مرفوع، وعلامة رفعه الألف؛ لأنه مثنى.");
  addResult(nodes, "kana:result:ism:jms", "اسم الناسخ مرفوع\nوعلامة رفعه الواو", "اسم الفعل الناسخ مرفوع، وعلامة رفعه الواو؛ لأنه جمع مذكر سالم.");
  addResult(nodes, "kana:result:ism:five", "اسم الناسخ مرفوع\nوعلامة رفعه الواو", "اسم الفعل الناسخ مرفوع، وعلامة رفعه الواو؛ لأنه من الأسماء الخمسة.");
  addResult(nodes, "kana:result:ism:jfs", "اسم الناسخ مرفوع\nبالضمة الظاهرة", "اسم الفعل الناسخ مرفوع، وعلامة رفعه الضمة الظاهرة؛ لأنه جمع مؤنث سالم.");
  addResult(nodes, "kana:result:ism:attached-ya", "اسم الناسخ مرفوع\nبضمة مقدرة قبل ياء المتكلم", "اسم الفعل الناسخ مرفوع بضمة مقدرة على ما قبل ياء المتكلم، وياء المتكلم ضمير في محل جر مضاف إليه.");
  addResult(nodes, "kana:result:ism:estimated", "اسم الناسخ مرفوع\nبضمة مقدرة على الألف", "اسم الفعل الناسخ مرفوع، وعلامة رفعه الضمة المقدرة على الألف منع من ظهورها التعذر.");
  addResult(nodes, "kana:result:ism:visible", "اسم الناسخ مرفوع\nبالضمة الظاهرة", "اسم الفعل الناسخ مرفوع، وعلامة رفعه الضمة الظاهرة على آخره.");

  addResult(nodes, "kana:result:khabar:verbal", "جملة فعلية\nفي محل نصب خبر الناسخ", "الجملة الفعلية في محل نصب خبر الفعل الناسخ.");
  addResult(nodes, "kana:result:khabar:nominal", "جملة اسمية\nفي محل نصب خبر الناسخ", "الجملة الاسمية في محل نصب خبر الفعل الناسخ.");
  addResult(nodes, "kana:result:khabar:jar", "جار ومجرور\nفي محل نصب خبر الناسخ", "شبه الجملة من الجار والمجرور في محل نصب خبر الفعل الناسخ.");
  addResult(nodes, "kana:result:khabar:zarf", "شبه جملة ظرفية\nفي محل نصب خبر الناسخ", "شبه الجملة الظرفية في محل نصب خبر الفعل الناسخ.");
  addResult(nodes, "kana:result:khabar:jar-advanced", "خبر مقدم جار ومجرور\nواسم الناسخ مؤخر مرفوع", "شبه الجملة من الجار والمجرور في محل نصب خبر الناسخ مقدم، والاسم النكرة بعده اسم الناسخ مؤخر مرفوع.");
  addResult(nodes, "kana:result:khabar:zarf-advanced", "خبر مقدم ظرف\nواسم الناسخ مؤخر مرفوع", "شبه الجملة الظرفية في محل نصب خبر الناسخ مقدم، والاسم النكرة بعده اسم الناسخ مؤخر مرفوع.");
  addResult(nodes, "kana:result:khabar:masdar", "مصدر مؤول\nفي محل نصب خبر الناسخ", "مصدر مؤول في محل نصب خبر الفعل الناسخ.");
  addResult(nodes, "kana:result:khabar:dual", "خبر الناسخ منصوب\nوعلامة نصبه الياء", "خبر الفعل الناسخ منصوب، وعلامة نصبه الياء؛ لأنه مثنى.");
  addResult(nodes, "kana:result:khabar:jms", "خبر الناسخ منصوب\nوعلامة نصبه الياء", "خبر الفعل الناسخ منصوب، وعلامة نصبه الياء؛ لأنه جمع مذكر سالم.");
  addResult(nodes, "kana:result:khabar:five", "خبر الناسخ منصوب\nوعلامة نصبه الألف", "خبر الفعل الناسخ منصوب، وعلامة نصبه الألف؛ لأنه من الأسماء الخمسة.");
  addResult(nodes, "kana:result:khabar:jfs", "خبر الناسخ منصوب\nبالكسرة نيابة عن الفتحة", "خبر الفعل الناسخ منصوب، وعلامة نصبه الكسرة نيابة عن الفتحة؛ لأنه جمع مؤنث سالم.");
  addResult(nodes, "kana:result:khabar:estimated", "خبر الناسخ منصوب\nبفتحة مقدرة على الألف", "خبر الفعل الناسخ منصوب، وعلامة نصبه الفتحة المقدرة على الألف منع من ظهورها التعذر.");
  addResult(nodes, "kana:result:khabar:visible", "خبر الناسخ منصوب\nبالفتحة الظاهرة", "خبر الفعل الناسخ منصوب، وعلامة نصبه الفتحة الظاهرة على آخره.");

  addStart(nodes, edges, "kana:role", example?.sentence || "كان وأخواتها");
  return { nodes, edges, rootId: "kana:role" };
}
