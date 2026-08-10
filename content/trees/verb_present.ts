import type { ExerciseTree } from "../../lib/exercise/model";


const deletedWeakHint = `نسند الفعل إلى الضمير هو لنتأكد من الحرف الأخير في أصل الفعل: يسعَ ← هو يسعى، يدعُ ← هو يدعو، يرمِ ← هو يرمي. الحرف الذي يظهر في الأصل ولا يظهر في الفعل المجزوم هو حرف العلة المحذوف.`;

export const presentVerbTree: ExerciseTree = {
  startNodeId: "present_build_check",
  nodes: {
    present_build_check: {
      id: "present_build_check",
      type: "question",
      context: "عرفنا أنه فعل مضارع، والمضارع قد يكون مبنيًا وقد يكون معربًا.",
      text: "هل اتصل به ما يجعله مبنيًا؟",
      hint: "انظر إلى آخر الفعل: هل اتصلت به نون النسوة أو نون التوكيد؟" ,
      answers: [
        { id: "a", text: "نون النسوة", next: "present_niswa_position", eval: { fact: "buildConnection", equals: "niswa" }, hint: "نون النسوة تكون لجماعة الإناث مثل: يساعدْنَ، وتبني المضارع على السكون، ثم نحدد محله من العامل السابق." },
        { id: "b", text: "نون التوكيد", next: "present_tawkid_position", eval: { fact: "buildConnection", equals: "tawkid" }, hint: "نون التوكيد تأتي لتأكيد الفعل مثل: أذاكرَنَّ، وتبني المضارع على الفتح، ثم نحدد محله من العامل السابق." },
        { id: "c", text: "لم يتصل به ما يبنيه", next: "present_tool_presence", eval: { fact: "buildConnection", equals: "none" }, hint: "إذا لم تتصل بالفعل نون النسوة ولا نون التوكيد، بقي الفعل المضارع معربًا." },
      ],
    },

    present_niswa_position: {
      id: "present_niswa_position",
      type: "question",
      context: "اتصلت بالفعل نون النسوة، فبُني على السكون. بقي أن نحدد محله الإعرابي من العامل السابق.",
      text: "ما محل الفعل المضارع بحسب العامل السابق؟",
      hint: "البناء يحدد حركة آخر الفعل، أما العامل السابق فيحدد محله: رفع أو نصب أو جزم.",
      answers: [
        { id: "a", text: "في محل رفع: لا ناصب ولا جازم", next: "R_present_binaa_niswa_raf3", eval: { fact: "hasTool", equals: false } },
        { id: "b", text: "في محل نصب: سبقه ناصب", next: "R_present_binaa_niswa_nasb", eval: { fact: "tool", equals: "nasb" } },
        { id: "c", text: "في محل جزم: سبقه جازم", next: "R_present_binaa_niswa_jazm", eval: { fact: "tool", equals: "jazm" } },
      ],
    },

    present_tawkid_position: {
      id: "present_tawkid_position",
      type: "question",
      context: "اتصلت بالفعل نون التوكيد اتصالًا مباشرًا، فبُني على الفتح. بقي أن نحدد محله الإعرابي من العامل السابق.",
      text: "ما محل الفعل المضارع بحسب العامل السابق؟",
      hint: "البناء يحدد حركة آخر الفعل، أما العامل السابق فيحدد محله: رفع أو نصب أو جزم.",
      answers: [
        { id: "a", text: "في محل رفع: لا ناصب ولا جازم", next: "R_present_binaa_tawkid_raf3", eval: { fact: "hasTool", equals: false } },
        { id: "b", text: "في محل نصب: سبقه ناصب", next: "R_present_binaa_tawkid_nasb", eval: { fact: "tool", equals: "nasb" } },
        { id: "c", text: "في محل جزم: سبقه جازم", next: "R_present_binaa_tawkid_jazm", eval: { fact: "tool", equals: "jazm" } },
      ],
    },

    present_tool_presence: {
      id: "present_tool_presence",
      type: "question",
      context: "لم يتصل به ما يبنيه، إذن هو فعل مضارع معرب. نحدد الآن العامل قبله.",
      text: "هل سبق الفعلَ ناصبٌ أو جازم؟",
      hint: "افحص ما قبل الفعل مباشرة، بما في ذلك الأداة إذا اتصلت بحرف عطف أو استئناف، مثل: فلن، ولم. هل سبقه ناصب أو جازم؟",
      answers: [
        { id: "a", text: "لا يوجد ناصب ولا جازم", next: "present_raf3_shape", eval: { fact: "hasTool", equals: false } },
        { id: "b", text: "سبقه حرف نصب", next: "present_nasb_shape", eval: { fact: "tool", equals: "nasb" } },
        { id: "c", text: "سبقه حرف جزم", next: "present_jazm_shape", eval: { fact: "tool", equals: "jazm" } },
      ],
    },

    present_raf3_shape: {
      id: "present_raf3_shape",
      type: "question",
      context: "لم يسبق الفعل ناصب ولا جازم، إذن هو مرفوع. نحدد صورته لنعرف علامة الرفع.",
      text: "ما صورة الفعل؟",
      hint: "افحص آخر الفعل واتصاله: أهو صحيح الآخر، معتل الآخر، أم من الأفعال الخمسة؟",
      answers: [
        { id: "a", text: "فعل صحيح الآخر", next: "R_present_raf3_sahih", eval: { fact: "shape", equals: "sahih" } },
        { id: "b", text: "فعل معتل الآخر", next: "present_raf3_weak_letter", eval: { fact: "shape", equals: "weak" } },
        { id: "c", text: "من الأفعال الخمسة", next: "R_present_raf3_five", eval: { fact: "shape", equals: "five" } },
      ],
    },

    present_raf3_weak_letter: {
      id: "present_raf3_weak_letter",
      type: "question",
      context: "الفعل مرفوع ومعتل الآخر، فنحدد حرف العلة لمعرفة سبب تقدير الضمة.",
      text: "ما حرف العلة في آخر الفعل؟",
      hint: "انظر إلى آخر الفعل: أهو ألف أم واو أم ياء؟",
      answers: [
        { id: "a", text: "الألف", next: "R_present_raf3_alif", eval: { fact: "weakLetter", equals: "alif" } },
        { id: "b", text: "الواو", next: "R_present_raf3_waw", eval: { fact: "weakLetter", equals: "waw" } },
        { id: "c", text: "الياء", next: "R_present_raf3_ya", eval: { fact: "weakLetter", equals: "ya" } },
      ],
    },

    present_nasb_shape: {
      id: "present_nasb_shape",
      type: "question",
      context: "سبق الفعل حرف نصب، إذن هو منصوب. نحدد صورته لنعرف علامة النصب.",
      text: "ما صورة الفعل؟",
      hint: "افحص آخر الفعل واتصاله: أهو صحيح الآخر، معتل الآخر، أم من الأفعال الخمسة؟",
      answers: [
        { id: "a", text: "فعل صحيح الآخر", next: "R_present_nasb_sahih", eval: { fact: "shape", equals: "sahih" } },
        { id: "b", text: "فعل معتل الآخر", next: "present_nasb_weak_letter", eval: { fact: "shape", equals: "weak" } },
        { id: "c", text: "من الأفعال الخمسة", next: "R_present_nasb_five", eval: { fact: "shape", equals: "five" } },
      ],
    },

    present_nasb_weak_letter: {
      id: "present_nasb_weak_letter",
      type: "question",
      context: "الفعل منصوب ومعتل الآخر، فنحدد حرف العلة لمعرفة علامة النصب.",
      text: "ما حرف العلة في آخر الفعل؟",
      hint: "انظر إلى آخر الفعل: أهو ألف أم واو أم ياء؟",
      answers: [
        { id: "a", text: "الألف", next: "R_present_nasb_alif", eval: { fact: "weakLetter", equals: "alif" } },
        { id: "b", text: "الواو", next: "R_present_nasb_waw", eval: { fact: "weakLetter", equals: "waw" } },
        { id: "c", text: "الياء", next: "R_present_nasb_ya", eval: { fact: "weakLetter", equals: "ya" } },
      ],
    },

    present_jazm_shape: {
      id: "present_jazm_shape",
      type: "question",
      context: "سبق الفعل حرف جزم، إذن هو مجزوم. نحدد صورته لنعرف علامة الجزم.",
      text: "ما صورة الفعل؟",
      hint: "افحص آخر الفعل واتصاله: أهو صحيح الآخر، معتل الآخر، أم من الأفعال الخمسة؟",
      answers: [
        { id: "a", text: "فعل صحيح الآخر", next: "R_present_jazm_sahih", eval: { fact: "shape", equals: "sahih" } },
        { id: "b", text: "فعل معتل الآخر", next: "present_jazm_weak_letter", eval: { fact: "shape", equals: "weak" } },
        { id: "c", text: "من الأفعال الخمسة", next: "R_present_jazm_five", eval: { fact: "shape", equals: "five" } },
      ],
    },

    present_jazm_weak_letter: {
      id: "present_jazm_weak_letter",
      type: "question",
      context: "الفعل مجزوم ومعتل الآخر، لذلك حُذف حرف العلة من آخره.",
      text: "ما حرف العلة المحذوف؟",
      hint: deletedWeakHint,
      answers: [
        { id: "a", text: "الألف", next: "R_present_jazm_weak_alif", eval: { fact: "weakLetter", equals: "alif" } },
        { id: "b", text: "الواو", next: "R_present_jazm_weak_waw", eval: { fact: "weakLetter", equals: "waw" } },
        { id: "c", text: "الياء", next: "R_present_jazm_weak_ya", eval: { fact: "weakLetter", equals: "ya" } },
      ],
    },

    R_present_binaa_niswa_raf3: {
      id: "R_present_binaa_niswa_raf3",
      type: "result",
      coverage: "present.binaa.niswa",
      text: "فعل مضارع مبني على السكون لاتصاله بنون النسوة، في محل رفع.\nملاحظة: الفعل هو في محل رفع؛ لأنه لم يُسبق بناصب أو جازم.\nنون النسوة: ضمير متصل مبني على الفتح في محل رفع فاعل."
    },
    R_present_binaa_niswa_nasb: {
      id: "R_present_binaa_niswa_nasb",
      type: "result",
      coverage: "present.binaa.niswa",
      text: "فعل مضارع مبني على السكون لاتصاله بنون النسوة، في محل نصب.\nملاحظة: الفعل هو في محل نصب؛ لأنه سُبق بناصب.\nنون النسوة: ضمير متصل مبني على الفتح في محل رفع فاعل."
    },
    R_present_binaa_niswa_jazm: {
      id: "R_present_binaa_niswa_jazm",
      type: "result",
      coverage: "present.binaa.niswa",
      text: "فعل مضارع مبني على السكون لاتصاله بنون النسوة، في محل جزم.\nملاحظة: الفعل هو في محل جزم؛ لأنه سُبق بجازم.\nنون النسوة: ضمير متصل مبني على الفتح في محل رفع فاعل."
    },
    R_present_binaa_tawkid_raf3: {
      id: "R_present_binaa_tawkid_raf3",
      type: "result",
      coverage: "present.binaa.tawkid",
      text: "فعل مضارع مبني على الفتح لاتصاله المباشر بنون التوكيد، في محل رفع.\nملاحظة: الفعل هو في محل رفع؛ لأنه لم يُسبق بناصب أو جازم.\nنون التوكيد: حرف يفيد توكيد الفعل، لا محل له من الإعراب."
    },
    R_present_binaa_tawkid_nasb: {
      id: "R_present_binaa_tawkid_nasb",
      type: "result",
      coverage: "present.binaa.tawkid",
      text: "فعل مضارع مبني على الفتح لاتصاله المباشر بنون التوكيد، في محل نصب.\nملاحظة: الفعل هو في محل نصب؛ لأنه سُبق بناصب.\nنون التوكيد: حرف يفيد توكيد الفعل، لا محل له من الإعراب."
    },
    R_present_binaa_tawkid_jazm: {
      id: "R_present_binaa_tawkid_jazm",
      type: "result",
      coverage: "present.binaa.tawkid",
      text: "فعل مضارع مبني على الفتح لاتصاله المباشر بنون التوكيد، في محل جزم.\nملاحظة: الفعل هو في محل جزم؛ لأنه سُبق بجازم.\nنون التوكيد: حرف يفيد توكيد الفعل، لا محل له من الإعراب."
    },

    R_present_raf3_sahih: {
      id: "R_present_raf3_sahih",
      type: "result",
      coverage: "present.raf3.sahih",
      text: "فعل مضارع مرفوع.\nعلامة رفعه: الضمة الظاهرة على آخره."
    },
    R_present_raf3_alif: {
      id: "R_present_raf3_alif",
      type: "result",
      coverage: "present.raf3.alif",
      text: "فعل مضارع مرفوع.\nعلامة رفعه: الضمة المقدرة على الألف منع من ظهورها التعذر."
    },
    R_present_raf3_waw: {
      id: "R_present_raf3_waw",
      type: "result",
      coverage: "present.raf3.waw",
      text: "فعل مضارع مرفوع.\nعلامة رفعه: الضمة المقدرة على الواو منع من ظهورها الثقل."
    },
    R_present_raf3_ya: {
      id: "R_present_raf3_ya",
      type: "result",
      coverage: "present.raf3.ya",
      text: "فعل مضارع مرفوع.\nعلامة رفعه: الضمة المقدرة على الياء منع من ظهورها الثقل."
    },
    R_present_raf3_five: {
      id: "R_present_raf3_five",
      type: "result",
      coverage: "present.raf3.five",
      text: "فعل مضارع مرفوع.\nعلامة رفعه: ثبوت النون؛ لأنه من الأفعال الخمسة.\nالأفعال الخمسة أفعال مضارعة اتصلت بألف الاثنين أو واو الجماعة أو ياء المخاطبة."
    },

    R_present_nasb_sahih: {
      id: "R_present_nasb_sahih",
      type: "result",
      coverage: "present.nasb.sahih",
      text: "فعل مضارع منصوب.\nعلامة نصبه: الفتحة الظاهرة على آخره."
    },
    R_present_nasb_alif: {
      id: "R_present_nasb_alif",
      type: "result",
      coverage: "present.nasb.alif",
      text: "فعل مضارع منصوب.\nعلامة نصبه: الفتحة المقدرة على الألف منع من ظهورها التعذر."
    },
    R_present_nasb_waw: {
      id: "R_present_nasb_waw",
      type: "result",
      coverage: "present.nasb.waw",
      text: "فعل مضارع منصوب.\nعلامة نصبه: الفتحة الظاهرة على آخره."
    },
    R_present_nasb_ya: {
      id: "R_present_nasb_ya",
      type: "result",
      coverage: "present.nasb.ya",
      text: "فعل مضارع منصوب.\nعلامة نصبه: الفتحة الظاهرة على آخره."
    },
    R_present_nasb_five: {
      id: "R_present_nasb_five",
      type: "result",
      coverage: "present.nasb.five",
      text: "فعل مضارع منصوب.\nعلامة نصبه: حذف النون؛ لأنه من الأفعال الخمسة.\nالأفعال الخمسة أفعال مضارعة اتصلت بألف الاثنين أو واو الجماعة أو ياء المخاطبة."
    },

    R_present_jazm_sahih: {
      id: "R_present_jazm_sahih",
      type: "result",
      coverage: "present.jazm.sahih",
      text: "فعل مضارع مجزوم.\nعلامة جزمه: السكون."
    },
    R_present_jazm_weak_alif: {
      id: "R_present_jazm_weak_alif",
      type: "result",
      coverage: "present.jazm.weak.alif",
      text: "فعل مضارع مجزوم.\nعلامة جزمه: حذف حرف العلة.\nحرف العلة المحذوف: الألف."
    },
    R_present_jazm_weak_waw: {
      id: "R_present_jazm_weak_waw",
      type: "result",
      coverage: "present.jazm.weak.waw",
      text: "فعل مضارع مجزوم.\nعلامة جزمه: حذف حرف العلة.\nحرف العلة المحذوف: الواو."
    },
    R_present_jazm_weak_ya: {
      id: "R_present_jazm_weak_ya",
      type: "result",
      coverage: "present.jazm.weak.ya",
      text: "فعل مضارع مجزوم.\nعلامة جزمه: حذف حرف العلة.\nحرف العلة المحذوف: الياء."
    },
    R_present_jazm_five: {
      id: "R_present_jazm_five",
      type: "result",
      coverage: "present.jazm.five",
      text: "فعل مضارع مجزوم.\nعلامة جزمه: حذف النون؛ لأنه من الأفعال الخمسة.\nالأفعال الخمسة أفعال مضارعة اتصلت بألف الاثنين أو واو الجماعة أو ياء المخاطبة."
    },
  }
};
