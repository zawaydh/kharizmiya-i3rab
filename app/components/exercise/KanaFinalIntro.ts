import type { PedagogyState } from "./ExercisePedagogyTypes";
import { kanaNasikhVerb } from "./KanaPedagogyLanguage";

export function kanaNasikhFinalIntro(state: PedagogyState) {
    const sentence = String(state?.currentSentence || "");
    const nasikh = kanaNasikhVerb(sentence);
    if (!sentence || nasikh === "الفعل الناسخ")
        return "";
    if (nasikh.includes("ما زال")) {
        return "ما: حرف نفي.\nزال: فعل ماضٍ ناسخ ناقص مبني على الفتح. وإذا حُذفت (ما) في بعض السياقات عاد (زال) فعلًا تامًا يكتفي بفاعل، ولا يحتاج إلى اسم وخبر. مثال: زالَ البأسُ؛ فـ(البأسُ) فاعل.";
    }
    if (nasikh.includes("ما انفكوا")) {
        return "ما: حرف نفي.\nانفكوا: فعل ماضٍ ناسخ ناقص مبني على الضم لاتصاله بواو الجماعة.";
    }
    if (nasikh.includes("ما برحا")) {
        return "ما: حرف نفي.\nبرحا: فعل ماضٍ ناسخ ناقص مبني على الفتح لاتصاله بألف الاثنين.";
    }
    if (nasikh.includes("أصبحن")) {
        return "أصبحن: فعل ماضٍ ناسخ ناقص مبني على السكون لاتصاله بنون النسوة.";
    }
    if (nasikh.includes("كنت") || nasikh.includes("كنا") || nasikh.includes("كنتم")) {
        return `${nasikh}: فعل ماضٍ ناسخ ناقص مبني على السكون لاتصاله بضمير رفع متحرك.`;
    }
    if (nasikh.includes("كانت")) {
        return "كانت: فعل ماضٍ ناسخ ناقص مبني على الفتح، والتاء للتأنيث الساكنة لا محل لها.";
    }
    if (nasikh.includes("أصبحت")) {
        return "أصبحت: فعل ماضٍ ناسخ ناقص مبني على الفتح، والتاء للتأنيث الساكنة لا محل لها.";
    }
    if (nasikh.includes("ليست")) {
        return "ليست: فعل ماضٍ ناسخ ناقص مبني على الفتح، والتاء للتأنيث الساكنة لا محل لها.";
    }
    return `${nasikh}: فعل ماضٍ ناسخ ناقص مبني على الفتح.`;
}

