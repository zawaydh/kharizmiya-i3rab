export type Example = { id: string; sentence: string; target: string; facts: Record<string, any>; covers: string[] };

export const attachedPronounsCoverageKeysOrdered = [
  "pronoun.raf3.attached",
  "pronoun.raf3.separate",
  "pronoun.nasb.attached",
  "pronoun.nasb.separate",
  "pronoun.jar",
];

export const attachedPronounsExamples: Example[] = [
  { id: "pr-01", sentence: "كتبتُ الدرسَ.", target: "تُ", facts: { position: "raf3", form: "attached", role: "fael" }, covers: ["pronoun.raf3.attached"] },
  { id: "pr-02", sentence: "أنا أقرأُ القصةَ.", target: "أنا", facts: { position: "raf3", form: "separate", role: "mubtada" }, covers: ["pronoun.raf3.separate"] },
  { id: "pr-03", sentence: "أكرمَكَ المعلمُ.", target: "كَ", facts: { position: "nasb", form: "attached", role: "mafool" }, covers: ["pronoun.nasb.attached"] },
  { id: "pr-04", sentence: "إيّاكَ نعبدُ.", target: "إيّاكَ", facts: { position: "nasb", form: "separate", role: "mafool_muqaddam" }, covers: ["pronoun.nasb.separate"] },
  { id: "pr-05", sentence: "هذا كتابُهُ.", target: "هُ", facts: { position: "jar", form: "attached", role: "mudaf_ileyh" }, covers: ["pronoun.jar"] },

  { id: "pr-06", sentence: "شاركْنا في المسابقةِ.", target: "نا", facts: { position: "raf3", form: "attached", role: "fael" }, covers: ["pronoun.raf3.attached"] },
  { id: "pr-07", sentence: "الطالباتُ كتبْنَ الواجبَ.", target: "نَ", facts: { position: "raf3", form: "attached", role: "fael" }, covers: ["pronoun.raf3.attached"] },
  { id: "pr-08", sentence: "هو يحفظُ القصيدةَ.", target: "هو", facts: { position: "raf3", form: "separate", role: "mubtada" }, covers: ["pronoun.raf3.separate"] },
  { id: "pr-09", sentence: "نحنُ نحترمُ النظامَ.", target: "نحنُ", facts: { position: "raf3", form: "separate", role: "mubtada" }, covers: ["pronoun.raf3.separate"] },
  { id: "pr-10", sentence: "شجّعَني أبي.", target: "ني", facts: { position: "nasb", form: "attached", role: "mafool" }, covers: ["pronoun.nasb.attached"] },
  { id: "pr-11", sentence: "زارَهم المديرُ.", target: "هم", facts: { position: "nasb", form: "attached", role: "mafool" }, covers: ["pronoun.nasb.attached"] },
  { id: "pr-12", sentence: "إيّاهُ قصدتُ.", target: "إيّاهُ", facts: { position: "nasb", form: "separate", role: "mafool_muqaddam" }, covers: ["pronoun.nasb.separate"] },
  { id: "pr-13", sentence: "إيّانا شجّعَ المدربُ.", target: "إيّانا", facts: { position: "nasb", form: "separate", role: "mafool_muqaddam" }, covers: ["pronoun.nasb.separate"] },
  { id: "pr-14", sentence: "دفترُكَ منظّمٌ.", target: "كَ", facts: { position: "jar", form: "attached", role: "mudaf_ileyh" }, covers: ["pronoun.jar"] },
  { id: "pr-15", sentence: "رأيُهُ سديدٌ.", target: "هُ", facts: { position: "jar", form: "attached", role: "mudaf_ileyh" }, covers: ["pronoun.jar"] },
];

const resultByRole: Record<string, string> = {
  "raf3.attached.fael": "ضمير متصل مبني في محل رفع فاعل",
  "raf3.separate.mubtada": "ضمير منفصل مبني في محل رفع مبتدأ",
  "nasb.attached.mafool": "ضمير متصل مبني في محل نصب مفعول به",
  "nasb.separate.mafool_muqaddam": "ضمير منفصل مبني في محل نصب مفعول به مقدم",
  "jar.attached.mudaf_ileyh": "ضمير متصل مبني في محل جر مضاف إليه",
};

function resultFor(ex: Example) {
  return resultByRole[`${ex.facts.position}.${ex.facts.form}.${ex.facts.role}`] || "ضمير مبني بحسب موقعه في الجملة";
}

const allResults = Array.from(new Set(attachedPronounsExamples.map(resultFor)));

function pronounOptionReason(ex: Example, option: string, correct: string): string {
  if (option === correct) return `صحيح؛ «${ex.target}» ${correct}.`;
  const selectedPosition = option.includes("رفع") ? "raf3" : option.includes("نصب") ? "nasb" : option.includes("جر") ? "jar" : "";
  const selectedForm = option.includes("متصل") ? "attached" : option.includes("منفصل") ? "separate" : "";
  const actualPosition = String(ex.facts.position || "");
  const actualForm = String(ex.facts.form || "");
  if (selectedPosition && selectedPosition !== actualPosition) {
    const actualRole = ex.facts.role === "fael" ? "فاعل" : ex.facts.role === "mubtada" ? "مبتدأ" : ex.facts.role === "mafool" ? "مفعول به" : ex.facts.role === "mafool_muqaddam" ? "مفعول به مقدّم" : "مضاف إليه";
    const actualCase = actualPosition === "raf3" ? "الرفع" : actualPosition === "nasb" ? "النصب" : "الجر";
    const formNote = selectedForm === "attached"
      ? "، كما يفترض أنه ضمير متصل"
      : selectedForm === "separate"
        ? "، كما يفترض أنه ضمير منفصل"
        : "";
    return `هذا الاختيار يضع الضمير في محل ${selectedPosition === "raf3" ? "رفع" : selectedPosition === "nasb" ? "نصب" : "جر"}${formNote}، لكن «${ex.target}» شغل موقع ${actualRole}؛ ولذلك محله ${actualCase} وصورته ${actualForm === "attached" ? "متصلة" : "منفصلة"}.`;
  }
  if (selectedForm && selectedForm !== actualForm) {
    return selectedForm === "attached"
      ? `هذا الاختيار يجعله متصلًا، لكن «${ex.target}» كلمة مستقلة لا تلتصق بما قبلها؛ لذلك هو ضمير منفصل.`
      : `هذا الاختيار يجعله منفصلًا، لكن «${ex.target}» ملتصق بكلمة قبله ولا يستقل عنها؛ لذلك هو ضمير متصل.`;
  }
  return `هذا الإعراب لا يجمع بين موقع «${ex.target}» الصحيح وصورته متصلًا أو منفصلًا.`;
}

export const attachedPronounsQuizExamples = attachedPronounsExamples.map((ex, i) => {
  const correct = resultFor(ex);
  const distractors = allResults.filter((item) => item !== correct);
  const rotated = [...distractors.slice(i % distractors.length), ...distractors.slice(0, i % distractors.length)];
  const options = [correct, ...rotated].slice(0, 4);
  return {
    ...ex,
    prompt: `ما الإعراب الكامل للضمير «${ex.target}»؟`,
    options,
    correctI3rab: correct,
    whyCorrect: "حددنا موقع الضمير ثم وظيفته في الجملة، وأتممنا الإعراب بذكر المحل والوظيفة معًا.",
    optionReasons: Object.fromEntries(options.map((o) => [o, pronounOptionReason(ex, o, correct)])),
  };
});
