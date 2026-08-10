import type { ExerciseAnswer } from "../../../lib/exercise/model";
import type { PedagogyNode, PedagogyState } from "./ExercisePedagogyTypes";
import { isFiveVerbDecision } from "./ExerciseDecisionHelpers";

export function verbStudentHintText(node: PedagogyNode | null | undefined, picked?: ExerciseAnswer, state?: PedagogyState): string | undefined {
  const id = String(node?.id || "");
  const target = state?.currentTarget || "الفعل";
    if (id.startsWith("past_")) {
        const pickedText = String(picked?.text || "");
        const facts = state?.facts || {};
        const targetPast = String(state?.currentTarget || "الفعل");
        const baseHuwa = String(facts.basePastHuwa || "");
        const reminder = "";
        if (id === "past_has_attachment") {
            const baseText = baseHuwa || targetPast.replace(/[ًٌٍَُِّْ]/g, "");
            if (pickedText.includes("نعم") && facts.hasAttached === false) {
                return `افصل آخر (${targetPast}) عن أصل الفعل، وقارنه بصورته مع «هو»: هو ${baseText}. لا توجد لاحقة متصلة مثل تاء أو «نا» أو ألف الاثنين أو واو الجماعة أو نون النسوة أو ضمير نصب؛ لذلك لم يتصل بآخره شيء.${reminder}`;
            }
            if ((pickedText.includes("لا") || pickedText.includes("لم")) && facts.hasAttached === true) {
                return `افصل آخر (${targetPast}) عن أصل الفعل، وقارنه بصورته مع «هو»: هو ${baseText}. وجود تاء أو «نا» أو ألف الاثنين أو واو الجماعة أو نون النسوة أو ضمير نصب يدل على اتصال شيء بآخر الفعل.${reminder}`;
            }
            return `افصل اللاحقة عن أصل الفعل، ثم قارنه بصورته الماضية مع «هو». ابحث عن تاء أو «نا» أو ألف الاثنين أو واو الجماعة أو نون النسوة أو ضمير نصب؛ ولا تعتمد على طول الكلمة وحده.${reminder}`;
        }
        if (id === "past_no_attachment_weak") {
            if (pickedText.includes("ألف") && facts.weakEnding === "none") {
                return `انتبه: آخر (${targetPast}) ليس ألفًا. في مثل قرأَ آخر الفعل همزة، والهمزة ليست حرف علة. حروف العلة هي: الألف والواو والياء فقط.${reminder}`;
            }
            return `انظر إلى آخر الفعل نفسه: هل هو ألف لينة مثل سعى ورمى، أم حرف صحيح ظاهر مثل كتبَ وقرأَ؟ الهمزة حرف صحيح وليست حرف علة.${reminder}`;
        }
        if (id === "past_connector_kind") {
            if (pickedText.includes("تاء التأنيث") && facts.connectorKind !== "taa_tanith") {
                return `تاء التأنيث علامة ساكنة لا تدل على الفاعل. مثل: غادرتْ الطائرةُ المطارَ، أو: الطائرةُ غادرتْ المطارَ؛ فالفاعل في الثانية ضمير مستتر تقديره هي لأن الفاعل لا يتقدم على الفعل. انظر هل المتصل هنا تاء تأنيث فعلًا أم ضمير.${reminder}`;
            }
            if (pickedText.includes("ضمير رفع") && facts.connectorKind !== "raf3") {
                return `ضمير الرفع يدل على الفاعل ويشغل موقعه؛ أي من قام بالفعل. أمّا إذا كان المتصل يدل على الشيء الذي وقع عليه الفعل فهو ضمير نصب، لا ضمير رفع.${reminder}`;
            }
            if (pickedText.includes("ضمير نصب") && facts.connectorKind !== "nasb") {
                return `ضمير النصب يدل على المفعول به ويشغل موقعه؛ أي الشيء أو الشخص الذي وقع عليه الفعل، ولا يدل على من قام بالفعل. اسأل: هل المتصل دل على الفاعل أم على المفعول به؟${reminder}`;
            }
            return `اسأل عن دلالة المتصل: هل أضمر الفاعل؟ فهو ضمير رفع. هل أضمر المفعول به؟ فهو ضمير نصب. أم أنه تاء تأنيث ساكنة لا تدل على فاعل؟${reminder}`;
        }
        if (id === "past_taa_weak") {
            const shown = baseHuwa ? `${targetPast} ← هو ${baseHuwa}` : `مشتْ ← هو مشى`;
            return `أسند الفعل إلى الضمير هو في الزمن الماضي، ثم قارن: ${shown}. إذا كان أصل الفعل ينتهي بألف أو واو أو ياء، وهذا الحرف غير ظاهر في الفعل أمامك، فهو حرف علة محذوف، وتكون حركة البناء مقدرة عليه. لا نرجع إلى المضارع.${reminder}`;
        }
        if (id === "past_deleted_letter_taa") {
            return `قارن: مشتْ ← هو مشى. آخر الأصل ألف، وهذه الألف غير ظاهرة في مشتْ؛ إذن المحذوف هو الألف. أمّا بقيتْ فالياء فيها ظاهرة، وليست من مسار الحذف.${reminder}`;
        }
        if (id === "past_raf3_type") {
            if (pickedText.includes("ألف الاثنين") && facts.raf3BuildGroup === "waw") {
                return `الألف في (${targetPast}) ليست ألف الاثنين. ألف الاثنين تكون ضميرًا يدل على اثنين مثل: رجعا / حضرا / سعيا. أما الألف بعد واو الجماعة في مثل رجعوا ومضوا وبقوا فهي ألف فارقة لا محل لها من الإعراب، والضمير هو واو الجماعة.${reminder}`;
            }
            if (pickedText.includes("واو الجماعة") && facts.raf3BuildGroup === "alif") {
                return `في مثل حضرا أو سعيا الضمير هو ألف الاثنين؛ لأنه يدل على فاعلين اثنين. واو الجماعة تكون في مثل رجعوا وبقوا.${reminder}`;
            }
            return `انظر إلى الضمير المتصل: تاء/نا/نون النسوة تبني على السكون، ألف الاثنين تدل على اثنين، وواو الجماعة تدل على جماعة والألف بعدها فارقة.${reminder}`;
        }
        if (id === "past_sukoon_raf3_type") {
            if (pickedText.includes("نا")) {
                return `انتبه: نا قد تكون للفاعلين أو للمفعولين. في حفظنا النشيدَ: نا أضمرت من قاموا بالحفظ، فهي نا الفاعلين في محل رفع فاعل. أما في حفظَنا اللهُ: نا أضمرت من وقع عليهم الحفظ، فهي نا المفعولين في محل نصب مفعول به، والفاعل هو اللهُ.${reminder}`;
            }
            return `تاء الفاعل مثل فهمتُ، ونا الفاعلين مثل حفظنا، ونون النسوة مثل جلسنَ. كلها ضمائر رفع متحركة تبني الفعل الماضي على السكون.${reminder}`;
        }
        if (id === "past_waw_weak") {
            const shown = baseHuwa ? `${targetPast} ← هو ${baseHuwa}` : `مَضَوْا ← هو مضى، بَقُوا ← هو بقي`;
            return `أسند الفعل إلى الضمير هو في الماضي ثم قارن: ${shown}. إذا كان أصل الفعل ينتهي بألف أو واو أو ياء، وهذا الحرف غير ظاهر أمامك، فهو حرف علة محذوف وتكون حركة البناء مقدرة عليه. لا ترجع إلى المضارع.${reminder}`;
        }
        if (id === "past_deleted_letter_waw") {
            if (facts.deletedLetter === "yaa" && pickedText.includes("الألف"))
                return `بَقُوا ← هو بقي. آخر الأصل ياء، إذن المحذوف ياء. لا تنخدع بالمضارع يبقى؛ نحن نرجع إلى الماضي مع هو.${reminder}`;
            if (facts.deletedLetter === "alif" && pickedText.includes("الياء"))
                return `مَضَوْا ← هو مضى. آخر الأصل ألف، إذن المحذوف ألف.${reminder}`;
            if (pickedText.includes("الواو"))
                return `الواو هنا واو الجماعة، ضمير متصل، وليست حرف العلة المحذوف. الحرف المحذوف نعرفه من صورة الماضي مع هو.${reminder}`;
            const shown = baseHuwa ? `${targetPast} ← هو ${baseHuwa}` : `مَضَوْا ← هو مضى، بَقُوا ← هو بقي`;
            return `قارن بالإسناد إلى هو في الماضي: ${shown}. الحرف الأخير في الأصل إذا اختفى قبل واو الجماعة فهو الحرف المحذوف.${reminder}`;
        }
    }
    if (id.startsWith("present_")) {
        const pickedText = String(picked?.text || "");
        const facts = state?.facts || {};
        const sentence = String(state?.currentSentence || "");
        const targetNow = String(state?.currentTarget || target || "الفعل");
        const toolWord = String(facts.toolWord || (sentence.includes("لم ") ? "لم" : sentence.includes("لن ") ? "لن" : sentence.includes(" أن ") ? "أن" : sentence.includes(" كي ") ? "كي" : sentence.includes("لا ") ? "لا الناهية" : sentence.includes("لِ") ? "لام الأمر" : "الأداة السابقة"));
        const baseWithHuwa = (() => {
            if (/سع/.test(targetNow))
                return "هو يسعى";
            if (/دع/.test(targetNow))
                return "هو يدعو";
            if (/رم/.test(targetNow))
                return "هو يرمي";
            const cleaned = targetNow.replace(/[ًٌٍَُِّْ]/g, "").replace(/وا$/, "ون");
            return `هو ${cleaned}`;
        })();
        const attachmentExplanation = (() => {
            if (facts.attached === "waw") {
                return `في (${targetNow}) الواو واو الجماعة: ضمير متصل، والألف بعدها ألف فارقة لا محل لها من الإعراب. ليست الواو ولا الألف حرف علة من أصل الفعل.`;
            }
            if (facts.attached === "alif2") {
                return `في (${targetNow}) الألف ألف الاثنين: ضمير متصل يدل على مثنى، وليست حرف علة من أصل الفعل.`;
            }
            if (facts.attached === "yaa") {
                return `في (${targetNow}) الياء ياء المخاطبة: ضمير متصل، وليست حرف علة من أصل الفعل.`;
            }
            return `الفعل المعتل الآخر هو ما كان آخر أصله حرف علة مثل: يدعو، يرمي، يسعى.`;
        })();
        if (id === "present_word_kind") {
            if (pickedText.includes("اسم"))
                return `الاسم لا يدل على زمن بنفسه. انظر إلى (${targetNow}): هل يدل على حدث يقع الآن أو يتكرر؟ إذا نعم فهو فعل.`;
            if (pickedText.includes("حرف"))
                return `الحرف لا يظهر معناه كاملًا إلا مع غيره. أما (${targetNow}) فيدل على حدث وزمن، لذلك ليس حرفًا.`;
            return `اسأل: هل (${targetNow}) يدل على عمل مرتبط بزمن؟ إذا نعم فهو فعل.`;
        }
        if (id === "present_tense") {
            if (pickedText.includes("ماض"))
                return `الماضي يدل على حدث وقع وانتهى مثل: كتبَ. أما (${targetNow}) فيدل على حدث يقع الآن أو يتجدد أو سيقع، فهو مضارع.`;
            if (pickedText.includes("أمر"))
                return `فعل الأمر طلب مباشر مثل: اكتبْ. أما (${targetNow}) فليس طلبًا، بل يدل على حدث حاضر أو متجدد.`;
            return `الفعل المضارع يدل على حدث يقع الآن أو يتجدد أو سيقع، مثل: يكتب، يسعى، يدعو.`;
        }
        if (id === "present_build_check") {
            if (pickedText.includes("نون النسوة") && facts.buildConnection !== "niswa") {
                if (facts.shape === "five")
                    return `نون النسوة تكون لجماعة الإناث مثل: الطالبات يكتبْنَ. أما (${targetNow}) فمن الأفعال الخمسة، والنون فيه علامة إعراب لا نون نسوة.`;
                return `نون النسوة تكون لجماعة الإناث مثل: الطالبات يكتبْنَ، وتبني المضارع على السكون. في (${targetNow}) لا توجد نون نسوة.`;
            }
            if (pickedText.includes("نون التوكيد") && facts.buildConnection !== "tawkid") {
                if (facts.shape === "five")
                    return `نون التوكيد تأتي لتأكيد الفعل مثل: أكتبنَّ. أما (${targetNow}) فالنون فيه علامة إعراب للأفعال الخمسة، لا نون توكيد.`;
                return `نون التوكيد تأتي لتأكيد الفعل مثل: أكتبنَّ، وتبني المضارع على الفتح. في (${targetNow}) لا توجد نون توكيد.`;
            }
            if (pickedText.includes("لم يتصل") && facts.buildConnection !== "none") {
                return `انظر إلى آخر (${targetNow}): اتصل به ما يبني المضارع. نون النسوة تبنيه على السكون، ونون التوكيد تبنيه على الفتح.`;
            }
            return `انظر إلى آخر الفعل (${targetNow}): هل اتصلت به نون النسوة أو نون التوكيد؟ إن لم تتصل به واحدة منهما فهو معرب.`;
        }
        if (id === "present_niswa_position" || id === "present_tawkid_position") {
            if (facts.tool === "jazm" && !pickedText.includes("جزم")) {
                return `اتصال النون يحدد بناء (${targetNow})، لكن (${toolWord}) جازم؛ لذلك يكون الفعل في محل جزم.`;
            }
            if (facts.tool === "nasb" && !pickedText.includes("نصب")) {
                return `اتصال النون يحدد بناء (${targetNow})، لكن (${toolWord}) ناصب؛ لذلك يكون الفعل في محل نصب.`;
            }
            if ((facts.tool === "none" || facts.hasTool === false) && !pickedText.includes("رفع")) {
                return `لم يسبق (${targetNow}) ناصب ولا جازم؛ لذلك يكون الفعل المبني في محل رفع.`;
            }
            return `علامة البناء ثابتة بسبب النون، أما المحل الإعرابي فيحدده العامل السابق: رفع بلا ناصب أو جازم، ونصب بعد الناصب، وجزم بعد الجازم.`;
        }
        if (id === "present_tool_presence") {
            if (facts.tool === "jazm" && !pickedText.includes("جزم")) {
                return `انظر إلى ما قبل الفعل (${targetNow}): سبقه الحرف (${toolWord}). و(${toolWord}) حرف جزم يدخل على الفعل المضارع؛ لذلك لا يصح اختيار أنه بلا ناصب ولا جازم أو أنه منصوب.`;
            }
            if (facts.tool === "nasb" && !pickedText.includes("نصب")) {
                return `انظر إلى ما قبل الفعل (${targetNow}): سبقه الحرف (${toolWord}). و(${toolWord}) حرف نصب يدخل على الفعل المضارع؛ لذلك لا يصح اختيار أنه مرفوع أو مجزوم.`;
            }
            if ((facts.tool === "none" || facts.hasTool === false) && (pickedText.includes("نصب") || pickedText.includes("جزم"))) {
                return `انظر قبل الفعل (${targetNow}) في الجملة: لا توجد أداة نصب ولا أداة جزم مؤثرة، لذلك يبقى الفعل مرفوعًا.`;
            }
            return `نحدد حالة المضارع من الأداة التي قبله مباشرة، وقد تتصل بحرف عطف أو استئناف مثل «فلن» و«ولم». أدوات النصب مثل لن وأن وكي تنصب، وأدوات الجزم مثل لم ولا الناهية ولام الأمر تجزم، وإذا لم توجد أداة مؤثرة فهو مرفوع.`;
        }
        if (id === "present_raf3_shape" || id === "present_nasb_shape" || id === "present_jazm_shape") {
            if (facts.shape === "five") {
                if (pickedText.includes("صحيح"))
                    return `صحيح أن أصل الفعل قد يكون صحيح الآخر، لكن الصورة أمامنا (${targetNow}) اتصلت بضمير من ضمائر الأفعال الخمسة؛ لذلك نعاملها كفعل من الأفعال الخمسة.`;
                if (pickedText.includes("معتل"))
                    return `${attachmentExplanation}\nإذن (${targetNow}) من الأفعال الخمسة، وعلامته هنا ${facts.tool === "jazm" ? "حذف النون للجزم" : facts.tool === "nasb" ? "حذف النون للنصب" : "ثبوت النون للرفع"}.`;
                return `الأفعال الخمسة أفعال مضارعة اتصلت بألف الاثنين أو واو الجماعة أو ياء المخاطبة. (${targetNow}) من هذا الباب لأنه اتصل بواحد منها.`;
            }
            if (facts.shape === "weak") {
                if (pickedText.includes("صحيح"))
                    return `نسند الفعل إلى الضمير هو لنتأكد من الحرف الأخير في أصل الفعل: ${targetNow} ← ${baseWithHuwa}. نلاحظ أن الأصل ينتهي بحرف علة؛ لذلك هو فعل معتل الآخر، وليس صحيح الآخر.`;
                if (pickedText.includes("الأفعال الخمسة"))
                    return `الأفعال الخمسة تحتاج اتصالًا بواو الجماعة أو ألف الاثنين أو ياء المخاطبة. في (${targetNow}) لا يوجد هذا الاتصال، بل نرجعه إلى أصله: ${baseWithHuwa}، فنجد آخره حرف علة.`;
                return `نسند الفعل إلى الضمير هو لنتأكد من الحرف الأخير في أصل الفعل: ${targetNow} ← ${baseWithHuwa}. إذا انتهى الأصل بألف أو واو أو ياء فهو معتل الآخر.`;
            }
            if (facts.shape === "sahih") {
                if (pickedText.includes("معتل"))
                    return `انظر إلى أصل الفعل (${targetNow}). آخره حرف صحيح وليس ألفًا ولا واوًا ولا ياءً. وإذا رأيت همزة مثل (قرأ) فالهمزة ليست حرف علة.`;
                if (pickedText.includes("الأفعال الخمسة"))
                    return `الأفعال الخمسة لا تكون إلا إذا اتصل المضارع بألف الاثنين أو واو الجماعة أو ياء المخاطبة. (${targetNow}) هنا لم يتصل بواحد منها.`;
                return `صحيح الآخر هو ما كان آخره الأصلي ليس حرف علة. حروف العلة هي: الألف، الواو، الياء فقط.`;
            }
        }
        if (id === "present_raf3_weak_letter" || id === "present_nasb_weak_letter" || id === "present_jazm_weak_letter") {
            const expected = facts.weakLetter === "alif" ? "الألف" : facts.weakLetter === "waw" ? "الواو" : facts.weakLetter === "ya" ? "الياء" : "حرف العلة";
            if (id === "present_jazm_weak_letter") {
                return `نسند الفعل إلى الضمير هو لنتأكد من الحرف الأخير في أصل الفعل: ${targetNow} ← ${baseWithHuwa}. الحرف الذي يظهر في الأصل ولا يظهر في الفعل المجزوم هو حرف العلة المحذوف. في هذا المثال المحذوف هو ${expected}.`;
            }
            return `أسند الفعل إلى هو: ${targetNow} ← ${baseWithHuwa}. انظر إلى آخر الأصل: حرف العلة هنا هو ${expected}.`;
        }
    }
    if (id.startsWith("imperative_")) {
        const pickedText = String(picked?.text || "");
        const facts = state?.facts || {};
        const targetNow = String(state?.currentTarget || target || "الفعل");
        const presentBase = String(facts.presentBase || (targetNow.includes("ادع") ? "يدعو" : targetNow.includes("ارم") ? "يرمي" : targetNow.includes("اسع") ? "يسعى" : "مضارعه"));
        if (id === "imperative_word_kind") {
            if (pickedText.includes("اسم"))
                return `الاسم لا يدل على طلب أو زمن بنفسه. انظر إلى (${targetNow}): هل يطلب عملًا من المخاطب؟`;
            if (pickedText.includes("حرف"))
                return `الحرف لا يظهر معناه كاملًا إلا مع غيره. أما (${targetNow}) فيدل على عمل مطلوب.`;
            return `الفعل يدل على حدث وزمن، وفعل الأمر يدل على طلب حصول الحدث.`;
        }
        if (id === "imperative_meaning") {
            if (pickedText.includes("وقع"))
                return `هذا معنى الماضي مثل: كتبَ. أما (${targetNow}) فهو طلب حصول الفعل، لا خبر عن شيء وقع.`;
            if (pickedText.includes("الآن") || pickedText.includes("يستقبل"))
                return `هذا معنى المضارع مثل: يكتبُ. أما (${targetNow}) فهو طلب مباشر للمخاطب.`;
            return `إذا كانت الكلمة تطلب من المخاطب أن يفعل شيئًا، فهي فعل أمر.`;
        }
        if (id === "imperative_connection") {
            const baseHuwa = String(facts.presentBase || (targetNow.includes("ادع") ? "يدعو" : targetNow.includes("ارم") ? "يرمي" : targetNow.includes("اسع") ? "يسعى" : "يكتب"));
            if (facts.attached === "none" && pickedText.includes("نعم"))
                return `أسند (${targetNow}) إلى المضارع مع الضمير هو: هو ${baseHuwa}. لا يظهر بعد أصل الفعل ضمير أو نون، لذلك لم يتصل بآخره شيء.`;
            if (facts.attached !== "none" && pickedText.includes("لا"))
                return `أسند (${targetNow}) إلى المضارع مع الضمير هو: هو ${baseHuwa}. ثم انظر إلى الزائد بعد أصل الفعل؛ ستجد أن آخر الأمر اتصل به شيء.`;
            return `نسند الفعل إلى المضارع مع الضمير هو لنعرف أصل آخره، ثم ننظر هل زاد بعد الأصل شيء.`;
        }
        if (id === "imperative_attached_kind") {
            const baseHuwa = String(facts.presentBase || "يكتب");
            if (pickedText.includes("نون النسوة") && facts.attached !== "niswa")
                return `نون النسوة ضمير يدل على جماعة الإناث مثل: اكتبْنَ، وتجعل الفعل مبنيًا على السكون. في (${targetNow}) ليست هذه النون هي المتصل الصحيح.`;
            if (pickedText.includes("نون التوكيد") && facts.attached !== "tawkid")
                return `نون التوكيد تؤكد الفعل وتقوّي معناه، ولا تدل على مؤنث، مثل: اكتبَنَّ. إذا لم تكن النون للتوكيد في (${targetNow}) فلا نختارها.`;
            if ((pickedText.includes("ألف الاثنين") || pickedText.includes("واو الجماعة") || pickedText.includes("ياء المخاطبة")) && !["alif2", "waw", "yaa"].includes(String(facts.attached || "")))
                return `ألف الاثنين وواو الجماعة وياء المخاطبة ضمائر مخاطبة، وعلامة البناء معها حذف النون. أسند (${targetNow}) إلى: هو ${baseHuwa} ثم حدد الزائد بعد أصل الفعل.`;
            return `أسند (${targetNow}) إلى المضارع مع الضمير هو: هو ${baseHuwa}. ما المتصل بعد أصل الفعل: نون النسوة، نون التوكيد، ألف الاثنين، واو الجماعة، أم ياء المخاطبة؟`;
        }
        if (id === "imperative_ending") {
            if (facts.ending === "weak" && pickedText.includes("صحيح"))
                return `أسند (${targetNow}) إلى المضارع مع الضمير هو: هو ${presentBase}. نلاحظ أن آخر الأصل حرف علة، لذلك هو معتل الآخر.`;
            if (facts.ending === "sahih" && pickedText.includes("معتل"))
                return `أسند (${targetNow}) إلى المضارع مع الضمير هو: هو ${presentBase || "يكتب"}. آخر الأصل ليس ألفًا ولا واوًا ولا ياءً، لذلك هو صحيح الآخر.`;
            return `نسند الأمر إلى المضارع مع الضمير هو: ادعُ ← هو يدعو، ارمِ ← هو يرمي، اسعَ ← هو يسعى.`;
        }
        if (id === "imperative_weak_letter") {
            const expected = facts.weakLetter === "alif" ? "الألف" : facts.weakLetter === "waw" ? "الواو" : facts.weakLetter === "ya" ? "الياء" : "حرف العلة";
            const pickedLetter = pickedText.includes("الألف")
                ? "الألف"
                : pickedText.includes("الواو")
                  ? "الواو"
                  : pickedText.includes("الياء")
                    ? "الياء"
                    : "";
            if (pickedLetter && pickedLetter !== expected) {
                return `اخترتَ ${pickedLetter}، لكن مضارع «${targetNow}» هو «${presentBase}»، وآخره ${expected}؛ إذن الحرف المحذوف هو ${expected}.`;
            }
            return `رُدَّ «${targetNow}» إلى مضارعه مع «هو»: هو ${presentBase}. الحرف الذي يظهر في آخر الأصل ويغيب في فعل الأمر هو ${expected}.`;
        }
    }
    if (id === "past_has_pronoun") {
        return `جرّب الإسناد إلى (هو): إذا تغيّر شكل الفعل عند قولك: هو ${String(target || "كتب").replace(/[ًٌٍَُِّْ]/g, "")}، فغالبًا كان في الكلمة ضمير متصل. مثال: كتبتُ ← هو كتب؛ إذن التاء ضمير.`;
    }
    if (id === "past_is_sukoon_set" || id === "past_sukoon_type") {
        return "فكّر هكذا: تاء الفاعل ونا الفاعلين ونون النسوة تجعل الماضي مبنيًا على السكون. جرّب فصل الضمير: كتبتُ ← كتبَ.";
    }
    if (isFiveVerbDecision(node)) {
        return `فكّر هكذا: الأفعال الخمسة لا نعرفها من المعنى، بل من الاتصال. هل ${target} اتصل بواو الجماعة أو ياء المخاطبة أو ألف الاثنين؟`;
    }
    if (id === "present_nun_niswa")
        return `نون النسوة ضمير يدل على مجموعة مؤنثة، مثل: يساعدْنَ، يدرسْنَ. إذا اتصلت بالمضارع بنته على السكون، ثم ننظر إلى العامل السابق لتحديد محله الإعرابي.`;
    if (id === "present_nun_tawkid")
        return `بعد استبعاد نون النسوة نفحص نون التوكيد. إذا اتصلت بالفعل مباشرة بنته على الفتح، ثم ننظر إلى العامل السابق لتحديد محله الإعرابي.`;
    if (id === "present_has_tool")
        return `لأن الفعل بقي معربًا، نفحص الآن ما قبله: هل سبقه أداة نصب أو جزم؟ أدوات النصب تنصب، وأدوات الجزم تجزم، وإن لم يسبق بأداة مؤثرة فهو مرفوع.`;
    if (id === "present_tool_type")
        return "فكّر هكذا: لن/أن/كي أدوات نصب، ولم/لا الناهية/لام الأمر أدوات جزم.";
    if (id.includes("ending") && !id.includes("kana") && !id.includes("inna"))
        return `حروف العلة هي: ا، و، ي. انظر إلى آخر الفعل (${target}): هل انتهى بألف أو واو أو ياء؟ إذا نعم فهو معتل الآخر، وإذا لا فهو صحيح الآخر.`;
    if (id.includes("weak") && !id.includes("kana") && !id.includes("inna"))
        return "حروف العلة هي: ا، و، ي. حدّد حرف العلة الأخير: هل هو ألف، أم واو/ياء؟ هذا يحدد نوع العلامة المقدرة أو الظاهرة.";
  return undefined;
}
