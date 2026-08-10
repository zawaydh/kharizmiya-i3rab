export function stripArabicMarksForKana(s: string) {
    return String(s || "").replace(/[\u064B-\u065F\u0670]/g, "").replace(/[،.؟]/g, "").trim();
}
export function kanaNasikhPrompt(sentence: string) {
    const t = stripArabicMarksForKana(sentence);
    if (t.includes("ما انفكوا"))
        return "من الذين";
    if (t.includes("ما برحا"))
        return "من اللذان";
    if (t.includes("ما زالت") || t.includes("ليست"))
        return "من التي";
    if (t.includes("أصبحن"))
        return "من اللواتي";
    return "من الذي";
}
export function kanaNasikhVerb(sentence: string) {
    const words = stripArabicMarksForKana(sentence).split(/\s+/).filter(Boolean);
    const hasSequence = (...parts: string[]) => words.some((_, index) => parts.every((part, offset) => words[index + offset] === part));
    if (hasSequence("ما", "انفكوا"))
        return "ما انفكوا";
    if (hasSequence("ما", "برحا"))
        return "ما برحا";
    if (hasSequence("ما", "زالت"))
        return "ما زالت";
    if (hasSequence("ما", "زال"))
        return "ما زال";
    const exact = [
        "أصبحن", "أصبحت", "أصبح", "ليست", "ليس", "صارت", "صار", "أمست", "أمسى",
        "باتت", "بات", "ظلت", "ظل", "كانت", "كان", "كنت", "كنا"
    ];
    return exact.find((verb) => words.includes(verb)) || "الفعل الناسخ";
}
export function kanaCleanWord(value: string) {
    return stripArabicMarksForKana(value || "").replace(/[«».,،؛؟!]/g, "").trim();
}
export function kanaIncludes(sentence: string, phrase: string) {
    return kanaCleanWord(sentence).includes(kanaCleanWord(phrase));
}
export function kanaSubjectFromSentence(sentence: string, target: string) {
    const targetClean = kanaCleanWord(target);
    const known = [
        "أبوك", "أخوك", "المحاسبون", "الطالبات", "اللاعبات", "المعلمون", "المعلمان", "الطالبان", "الوزيران", "المزارع", "الطريق", "العامل", "الكتاب", "الشارع", "الملعب", "طموحي", "الطالب", "الفتى", "الماء", "الجو", "الطفل", "مهند", "أسماء", "أختي", "الناس", "رجل", "ضيف"
    ].sort((a, b) => kanaCleanWord(b).length - kanaCleanWord(a).length);
    for (const k of known) {
        if (kanaIncludes(sentence, k) && targetClean !== kanaCleanWord(k))
            return k;
    }
    // fallback: اختر الاسم الظاهر بعد الناسخ أو قبله في الجملة، لا عبارة تعريفية عامة.
    const clean = kanaCleanWord(sentence);
    const words = clean.split(/\s+/).filter(Boolean);
    const nasikhWords = ["كان", "كانت", "كنت", "أصبح", "أصبحت", "صار", "أمسى", "بات", "ظل", "ليس", "ليست", "زال"];
    const idx = words.findIndex(w => nasikhWords.includes(w));
    const nextWord = idx >= 0 ? words[idx + 1] : undefined;
    if (nextWord && kanaCleanWord(nextWord) !== targetClean)
        return nextWord;
    if (words[0] && kanaCleanWord(words[0]) !== targetClean)
        return words[0];
    return "الاسم الذي تتحدث عنه الجملة";
}
export function kanaKhabarFromSentence(sentence: string, target: string) {
    const targetClean = kanaCleanWord(target);
    const known = [
        "كريمًا", "كريما", "أمرًا جيدًا", "أمرا جيدا", "حاضرين", "حاضرًا", "حاضرا", "نشيطًا", "نشيطا", "بخارًا", "بخارا", "معتدلًا", "معتدلا", "مزدحمًا", "مزدحما", "مطمئنًا", "مطمئنا", "مبرمجًا", "مبرمجا", "متسرعة", "ماهرات", "مخلصين", "مجتهدات", "حارًّا", "حارا", "واضحًا", "واضحا", "أخي", "أختي", "في الحقيبة", "عند المدير", "في السوق", "يقرأ", "يعمل", "أن أتميز", "أن تتجاهل الناس", "أطرافه ممتدة", "لونه باهتا"
    ];
    for (const k of known) {
        if (kanaIncludes(sentence, k) && targetClean !== kanaCleanWord(k))
            return k;
    }
    const words = kanaCleanWord(sentence).split(/\s+/).filter(Boolean);
    const targetIndex = words.findIndex(w => kanaCleanWord(w) === targetClean);
    if (targetIndex >= 0 && words[targetIndex + 1])
        return words.slice(targetIndex + 1).join(" ");
    return "الكلمة التي أتمت المعنى";
}
export function kanaKhabarRelationLabel(target: string, subject: string) {
    return `أتمَّت (${target}) معنى الجملة عن (${subject})`;
}
export function kanaNasikhSubjectChoice(nasikh: string, target: string) {
    return `صاحب معنى (${nasikh}) هو (${target})`;
}
export function kanaNasikhSubjectQuestion(nasikh: string, _khabar: string, _subject: string) {
    return `أيُّ كلمة هي صاحبة معنى (${nasikh}) في الجملة؟ اختر الإجابة الصحيحة مما يلي:`;
}

