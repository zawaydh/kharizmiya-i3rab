export const WHO_WITH_ME_GROUPS = ["mansubat", "marfuat", "majrurat", "mabniyat", "majzumat"] as const;

export type WhoWithMeGroup = (typeof WHO_WITH_ME_GROUPS)[number];

export const WHO_WITH_ME_GROUP_LABELS: Record<WhoWithMeGroup, string> = {
  mansubat: "المنصوبات",
  marfuat: "المرفوعات",
  majrurat: "المجرورات",
  mabniyat: "المبنيات",
  majzumat: "المجزومات",
};

export const WHO_WITH_ME_GROUP_GUIDANCE: Record<WhoWithMeGroup, string> = {
  mansubat: "اجمع الكلمات المعربة التي حكمها النصب. أمّا المبني الذي يقع في محل نصب فنضعه في فريق المبنيات في هذه اللعبة حتى لا تتداخل الفرق.",
  marfuat: "اجمع الكلمات المعربة التي حكمها الرفع. أمّا المبني الذي يقع في محل رفع فنضعه في فريق المبنيات في هذه اللعبة حتى لا تتداخل الفرق.",
  majrurat: "اجمع الأسماء المعربة التي حكمها الجر بحرف جر أو بالإضافة أو التبعية. أمّا المبني الذي يقع في محل جر فنضعه في فريق المبنيات.",
  mabniyat: "اختر الكلمات التي يلزم آخرها صورة واحدة ولا تتغير علامتها بتغير موقعها، مثل الضمائر وأسماء الإشارة وبعض الأفعال المبنية.",
  majzumat: "اختر الأفعال المضارعة المعربة التي دخل عليها جازم. لا تختَر فعل الأمر المبني على السكون، ولا المضارع المبني مع نون النسوة أو نون التوكيد.",
};

export type WhoWithMeCard = {
  id: string;
  word: string;
  context: string;
  group: WhoWithMeGroup;
  reason: string;
};

export type WhoWithMeCycle = {
  id: string;
  title: string;
  cards: WhoWithMeCard[];
};

const cycleOneCards: WhoWithMeCard[] = [
  { id: "c1-mansub-book", word: "الكِتَابَ", context: "قَرَأَ الطَّالِبُ الكِتَابَ.", group: "mansubat", reason: "مفعول به منصوب، وعلامة نصبه الفتحة الظاهرة." },
  { id: "c1-mansub-hal", word: "مَسْرُورًا", context: "عَادَ الطَّالِبُ مَسْرُورًا.", group: "mansubat", reason: "حال منصوب يبيّن هيئة الطالب عند عودته، وعلامة نصبه الفتحة." },
  { id: "c1-mansub-inna", word: "العِلْمَ", context: "إِنَّ العِلْمَ نُورٌ.", group: "mansubat", reason: "اسم إنَّ منصوب، وعلامة نصبه الفتحة." },
  { id: "c1-mansub-kana", word: "قَائِمًا", context: "كَانَ الطَّالِبُ قَائِمًا.", group: "mansubat", reason: "خبر كان منصوب، وعلامة نصبه الفتحة." },
  { id: "c1-mansub-dual", word: "الطَّالِبَيْنِ", context: "كَرَّمْتُ الطَّالِبَيْنِ.", group: "mansubat", reason: "مفعول به منصوب، وعلامة نصبه الياء لأنه مثنى." },

  { id: "c1-marfu-fael", word: "الطَّالِبُ", context: "حَضَرَ الطَّالِبُ.", group: "marfuat", reason: "فاعل مرفوع، وعلامة رفعه الضمة الظاهرة." },
  { id: "c1-marfu-mubtada", word: "العِلْمُ", context: "العِلْمُ نُورٌ.", group: "marfuat", reason: "مبتدأ مرفوع، وعلامة رفعه الضمة." },
  { id: "c1-marfu-khabar", word: "مُفِيدٌ", context: "الكِتَابُ مُفِيدٌ.", group: "marfuat", reason: "خبر مرفوع، وعلامة رفعه الضمة." },
  { id: "c1-marfu-ism-kana", word: "المُعَلِّمُ", context: "كَانَ المُعَلِّمُ حَاضِرًا.", group: "marfuat", reason: "اسم كان مرفوع، وعلامة رفعه الضمة." },
  { id: "c1-marfu-mudari", word: "يَكْتُبُ", context: "الطَّالِبُ يَكْتُبُ وَاجِبَهُ.", group: "marfuat", reason: "فعل مضارع مرفوع لأنه لم يُسبق بناصب أو جازم، وعلامة رفعه الضمة." },

  { id: "c1-majrur-harf", word: "البَيْتِ", context: "ذَهَبْتُ إِلَى البَيْتِ.", group: "majrurat", reason: "اسم مجرور بحرف الجر «إلى»، وعلامة جره الكسرة." },
  { id: "c1-majrur-idafa", word: "الطَّالِبِ", context: "كِتَابُ الطَّالِبِ جَدِيدٌ.", group: "majrurat", reason: "مضاف إليه مجرور، وعلامة جره الكسرة." },
  { id: "c1-majrur-naat", word: "المُجْتَهِدِ", context: "مَرَرْتُ بِالطَّالِبِ المُجْتَهِدِ.", group: "majrurat", reason: "نعت مجرور تابع للمنعوت المجرور، وعلامة جره الكسرة." },
  { id: "c1-majrur-jam-mudh", word: "المُعَلِّمِينَ", context: "سَلَّمْتُ عَلَى المُعَلِّمِينَ.", group: "majrurat", reason: "اسم مجرور بـ«على»، وعلامة جره الياء لأنه جمع مذكر سالم." },
  { id: "c1-majrur-dual", word: "الطَّالِبَيْنِ", context: "مَرَرْتُ بِالطَّالِبَيْنِ.", group: "majrurat", reason: "اسم مجرور بالباء، وعلامة جره الياء لأنه مثنى." },

  { id: "c1-mabni-ishara", word: "هَذَا", context: "هَذَا كِتَابٌ.", group: "mabniyat", reason: "اسم إشارة مبني على السكون في محل رفع مبتدأ؛ فهو مبني وليس اسمًا معربًا مرفوعًا." },
  { id: "c1-mabni-damir", word: "هُوَ", context: "هُوَ مُجْتَهِدٌ.", group: "mabniyat", reason: "ضمير منفصل مبني على الفتح في محل رفع مبتدأ." },
  { id: "c1-mabni-past", word: "كَتَبَ", context: "كَتَبَ الطَّالِبُ الدَّرْسَ.", group: "mabniyat", reason: "فعل ماضٍ مبني على الفتح." },
  { id: "c1-mabni-amr", word: "اُكْتُبْ", context: "اُكْتُبْ وَاجِبَكَ.", group: "mabniyat", reason: "فعل أمر مبني على السكون؛ السكون هنا علامة بناء لا جزم." },
  { id: "c1-mabni-niswa", word: "يَكْتُبْنَ", context: "الطَّالِبَاتُ يَكْتُبْنَ الدَّرْسَ.", group: "mabniyat", reason: "فعل مضارع مبني على السكون لاتصاله بنون النسوة، وهو في محل رفع هنا لأنه لم يُسبق بناصب أو جازم." },

  { id: "c1-majzum-lam", word: "يَكْتُبْ", context: "لَمْ يَكْتُبْ خَالِدٌ.", group: "majzumat", reason: "فعل مضارع مجزوم بـ«لم»، وعلامة جزمه السكون." },
  { id: "c1-majzum-nahia", word: "تُهْمِلْ", context: "لَا تُهْمِلْ وَاجِبَكَ.", group: "majzumat", reason: "فعل مضارع مجزوم بـ«لا» الناهية، وعلامة جزمه السكون." },
  { id: "c1-majzum-shart", word: "تَجْتَهِدْ", context: "إِنْ تَجْتَهِدْ تَنْجَحْ.", group: "majzumat", reason: "فعل مضارع مجزوم لأنه فعل الشرط، وعلامة جزمه السكون." },
  { id: "c1-majzum-jawab", word: "تَنْجَحْ", context: "إِنْ تَجْتَهِدْ تَنْجَحْ.", group: "majzumat", reason: "فعل مضارع مجزوم لأنه جواب الشرط، وعلامة جزمه السكون." },
  { id: "c1-majzum-five", word: "يَكْتُبُوا", context: "لَمْ يَكْتُبُوا الوَاجِبَ.", group: "majzumat", reason: "فعل مضارع مجزوم بـ«لم»، وعلامة جزمه حذف النون لأنه من الأفعال الخمسة." },
];

const cycleTwoCards: WhoWithMeCard[] = [
  { id: "c2-mansub-jfs", word: "المُوَظَّفَاتِ", context: "كَرَّمَ المُدِيرُ المُوَظَّفَاتِ.", group: "mansubat", reason: "مفعول به منصوب، وعلامة نصبه الكسرة نيابة عن الفتحة لأنه جمع مؤنث سالم." },
  { id: "c2-mansub-five", word: "أَبَاكَ", context: "رَأَيْتُ أَبَاكَ.", group: "mansubat", reason: "مفعول به منصوب، وعلامة نصبه الألف لأنه من الأسماء الخمسة؛ فهو مفرد مكبر مضاف إلى غير ياء المتكلم." },
  { id: "c2-mansub-zarf", word: "صَبَاحًا", context: "سَافَرْتُ صَبَاحًا.", group: "mansubat", reason: "مفعول فيه (ظرف زمان) منصوب، وعلامة نصبه الفتحة." },
  { id: "c2-mansub-liajlih", word: "رَغْبَةً", context: "اجْتَهَدْتُ رَغْبَةً فِي النَّجَاحِ.", group: "mansubat", reason: "مفعول لأجله منصوب، وعلامة نصبه الفتحة." },
  { id: "c2-mansub-mutlaq", word: "شُكْرًا", context: "شَكَرْتُهُ شُكْرًا.", group: "mansubat", reason: "مفعول مطلق منصوب، وعلامة نصبه الفتحة." },

  { id: "c2-marfu-jam-mudh", word: "المُعَلِّمُونَ", context: "حَضَرَ المُعَلِّمُونَ.", group: "marfuat", reason: "فاعل مرفوع، وعلامة رفعه الواو لأنه جمع مذكر سالم." },
  { id: "c2-marfu-dual", word: "الطَّالِبَانِ", context: "الطَّالِبَانِ مُجْتَهِدَانِ.", group: "marfuat", reason: "مبتدأ مرفوع، وعلامة رفعه الألف لأنه مثنى." },
  { id: "c2-marfu-five", word: "أَخُوكَ", context: "أَخُوكَ كَرِيمٌ.", group: "marfuat", reason: "مبتدأ مرفوع، وعلامة رفعه الواو لأنه من الأسماء الخمسة؛ فهو مفرد مكبر مضاف إلى غير ياء المتكلم." },
  { id: "c2-marfu-jfs", word: "المُعَلِّمَاتُ", context: "المُعَلِّمَاتُ مُجْتَهِدَاتٌ.", group: "marfuat", reason: "مبتدأ مرفوع، وعلامة رفعه الضمة لأنه جمع مؤنث سالم." },
  { id: "c2-marfu-five-verbs", word: "يَكْتُبَانِ", context: "الطَّالِبَانِ يَكْتُبَانِ الدَّرْسَ.", group: "marfuat", reason: "فعل مضارع مرفوع بثبوت النون لأنه من الأفعال الخمسة ولم يُسبق بناصب أو جازم." },

  { id: "c2-majrur-five", word: "أَخِيكَ", context: "سَلَّمْتُ عَلَى أَخِيكَ.", group: "majrurat", reason: "اسم مجرور بـ«على»، وعلامة جره الياء لأنه من الأسماء الخمسة؛ فهو مفرد مكبر مضاف إلى غير ياء المتكلم." },
  { id: "c2-majrur-dual", word: "الطَّالِبَيْنِ", context: "مَرَرْتُ بِالطَّالِبَيْنِ.", group: "majrurat", reason: "اسم مجرور بالباء، وعلامة جره الياء لأنه مثنى." },
  { id: "c2-majrur-jam-mudh", word: "المُعَلِّمِينَ", context: "اسْتَمَعْتُ إِلَى المُعَلِّمِينَ.", group: "majrurat", reason: "اسم مجرور بـ«إلى»، وعلامة جره الياء لأنه جمع مذكر سالم." },
  { id: "c2-majrur-jfs", word: "المُعَلِّمَاتِ", context: "سَلَّمْتُ عَلَى المُعَلِّمَاتِ.", group: "majrurat", reason: "اسم مجرور بـ«على»، وعلامة جره الكسرة." },
  { id: "c2-majrur-idafa", word: "المَدْرَسَةِ", context: "بَابُ المَدْرَسَةِ وَاسِعٌ.", group: "majrurat", reason: "مضاف إليه مجرور، وعلامة جره الكسرة." },

  { id: "c2-mabni-ishara", word: "هَذِهِ", context: "رَأَيْتُ هَذِهِ.", group: "mabniyat", reason: "اسم إشارة مبني على الكسر في محل نصب مفعول به؛ ووضعناه مع المبنيات في هذه اللعبة لأننا نفصل البناء عن الإعراب الظاهر." },
  { id: "c2-mabni-damir", word: "نَحْنُ", context: "نَحْنُ نَتَعَلَّمُ.", group: "mabniyat", reason: "ضمير منفصل مبني على الضم في محل رفع مبتدأ." },
  { id: "c2-mabni-past-waw", word: "ذَهَبُوا", context: "الطُّلَّابُ ذَهَبُوا مُبَكِّرًا.", group: "mabniyat", reason: "فعل ماضٍ مبني على الضم لاتصاله بواو الجماعة." },
  { id: "c2-mabni-amr-five", word: "اُكْتُبُوا", context: "اُكْتُبُوا الدَّرْسَ.", group: "mabniyat", reason: "فعل أمر مبني على حذف النون لأن مضارعه من الأفعال الخمسة." },
  { id: "c2-mabni-tawkid", word: "لَيَكْتُبَنَّ", context: "وَاللَّهِ لَيَكْتُبَنَّ الطَّالِبُ وَاجِبَهُ.", group: "mabniyat", reason: "فعل مضارع مبني على الفتح لاتصاله المباشر بنون التوكيد الثقيلة، وهو في محل رفع هنا." },

  { id: "c2-majzum-weak-waw", word: "يَدْعُ", context: "لَمْ يَدْعُ خَالِدٌ إِلَى الشَّرِّ.", group: "majzumat", reason: "فعل مضارع مجزوم بـ«لم»، وعلامة جزمه حذف حرف العلة؛ أصله «يدعو»." },
  { id: "c2-majzum-weak-yaa", word: "يَرْمِ", context: "لَمْ يَرْمِ اللَّاعِبُ الكُرَةَ.", group: "majzumat", reason: "فعل مضارع مجزوم بـ«لم»، وعلامة جزمه حذف حرف العلة؛ أصله «يرمي»." },
  { id: "c2-majzum-weak-alif", word: "تَسْعَ", context: "لَمْ تَسْعَ الطَّالِبَةُ إِلَى الشَّرِّ.", group: "majzumat", reason: "فعل مضارع مجزوم بـ«لم»، وعلامة جزمه حذف حرف العلة؛ أصله «تسعى»." },
  { id: "c2-majzum-five-plural", word: "تَكْتُبُوا", context: "لَا تَكْتُبُوا عَلَى الجِدَارِ.", group: "majzumat", reason: "فعل مضارع مجزوم بـ«لا» الناهية، وعلامة جزمه حذف النون لأنه من الأفعال الخمسة." },
  { id: "c2-majzum-five-fem", word: "تَكْتُبِي", context: "لَا تَكْتُبِي عَلَى الجِدَارِ.", group: "majzumat", reason: "فعل مضارع مجزوم بـ«لا» الناهية، وعلامة جزمه حذف النون لأنه من الأفعال الخمسة." },
];

export const WHO_WITH_ME_CYCLES: WhoWithMeCycle[] = [
  { id: "cycle-1", title: "الدورة الأولى", cards: cycleOneCards },
  { id: "cycle-2", title: "الدورة الثانية — أمثلة جديدة", cards: cycleTwoCards },
];

export function cardsForRound(cycle: WhoWithMeCycle, target: WhoWithMeGroup): WhoWithMeCard[] {
  const targetCards = cycle.cards.filter((card) => card.group === target);
  const otherGroups = WHO_WITH_ME_GROUPS.filter((group) => group !== target);
  const targetIndex = WHO_WITH_ME_GROUPS.indexOf(target);
  const distractors = otherGroups.map((group, offset) => {
    const candidates = cycle.cards.filter((card) => card.group === group);
    return candidates[(targetIndex + offset) % candidates.length];
  }).filter((card): card is WhoWithMeCard => Boolean(card));

  const extraGroup = otherGroups[targetIndex % otherGroups.length];
  const extraCandidates = cycle.cards.filter((card) => card.group === extraGroup);
  const extra = extraCandidates.find((card) => !distractors.some((item) => item.id === card.id));
  if (extra) distractors.push(extra);

  function order(card: WhoWithMeCard) {
    const key = `${cycle.id}:${target}:${card.id}`;
    let value = 0;
    for (let index = 0; index < key.length; index += 1) value = (value * 31 + key.charCodeAt(index)) >>> 0;
    return value;
  }

  return [...targetCards, ...distractors].sort((a, b) => order(a) - order(b));
}
