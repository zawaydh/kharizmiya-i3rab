import { describe, test, expect } from "vitest";
import * as fs from "node:fs";

const read = (path: string) => fs.readFileSync(path, "utf8");

describe("الإغلاق الأكاديمي ووضوح الطالب المستجد", () => {
  test("خيار المضارع يذكر النونين صراحة", () => {
    const map = read("app/components/visual-path/presentVerbMap.ts");
    expect(map).not.toContain('label: "غير متصل بهما"');
    expect(map).toContain('label: "لا نون النسوة ولا نون التوكيد"');
  });

  test("خيار رفع المضارع يصرح بالناصب والجازم", () => {
    const map = read("app/components/visual-path/presentVerbMap.ts");
    expect(map).not.toContain('label: "لم يُسبق بعامل"');
    expect(map).toContain('label: "لا ناصب ولا جازم قبله"');
  });

  test("مفتاح الكلمة الأولى لا يحول كل حرف وبعده فعل إلى المضارع", () => {
    const tree = read("content/trees/first_word.ts");
    expect(tree).toContain("R_first_particle_verb");
    expect(tree).not.toContain("راجع باب الفعل المضارع لاستكمال تعلّم أثر الأداة في الفعل");
  });

  test("الحرف قبل الاسم لا يعامل دائمًا كحرف جر", () => {
    const tree = read("content/trees/first_word.ts");
    expect(tree).toContain("عرفت مفتاح الجملة: بدأت بحرف وبعده اسم. حدّد نوع الحرف وأثره.");
    expect(tree).not.toContain("في أمثلة حروف الجر تتكوّن شبه جملة");



  });

  test("تعريف الفاعل يعتمد الإسناد", () => {
    const tree = read("content/trees/fael.ts");
    expect(tree).toContain("أُسند إليه الفعل");
    expect(tree).not.toContain("ما دل على سبب الفعل");
    expect(tree).not.toContain("ما أحدثه");
  });

  test("لا تبقى أمثلة ما فعلت الملتبسة كمصدر مؤول", () => {
    expect(read("content/examples/fael.examples.ts")).not.toContain("أعجبني ما فعلتَ");
    expect(read("content/examples/mafool.examples.ts")).not.toContain("كرهتُ ما فعلتَ");
  });

  test("المفعول به يبحث عن الفعل داخل الجملة كلها", () => {
    const tree = read("content/trees/mafool.ts");
    expect(tree).toContain("الفعل الذي تتعلق به الكلمة");
    expect(tree).toContain("الطالبُ كتبَ الواجبَ");
  });

  test("شروط الأسماء الخمسة تتضمن التكبير", () => {
    const examples = read("content/examples/mafool.examples.ts");
    expect(examples).toContain("مفردة، مكبرة، مضافة، ومضافة إلى غير ياء المتكلم");
    expect(examples).not.toContain('const fiveConditions = "مفردة، مضافة');
  });

  test("باب الضمائر لا يساوي محل الجر بالإضافة دائمًا", () => {
    const tree = read("content/trees/attached_pronouns.ts");
    expect(tree).toContain("كتابُه");
    expect(tree).toContain("به");
    expect(tree).toContain("في محل جر بحرف الجر");
  });

  test("الحال يثبت صاحب الحال قبل الانتقال إلى النوع", () => {
    const tree = read("content/trees/hal.ts");
    expect(tree).toContain("صاحب الحال");
    expect(tree).toContain("من الذي كان على هذه الهيئة");
  });

  test("الحالات الناقصة في النصب أصبحت ظاهرة", () => {
    expect(read("content/trees/la_nafiya.ts")).toContain("على الكسرة في محل نصب");
    expect(read("content/trees/munada.ts")).toContain("جمع مؤنث سالم");
    expect(read("content/trees/munada.ts")).toContain("جمع تكسير");
    expect(read("content/trees/istithna.ts")).toContain("جمع مؤنث سالم");
    expect(read("content/trees/istithna.ts")).toContain("جمع تكسير");
  });

  test("القاموس يشرح العامل والمحل والبناء للمستجد", () => {
    const glossary = read("app/components/exercise/ExerciseSharedViews.tsx");
    expect(glossary).toContain('"العامل"');
    expect(glossary).toContain('"المحل الإعرابي"');
    expect(glossary).toContain('"مبني"');
    expect(glossary).toContain("يلزم صورة واحدة");
  });

  test("الاختبار لا يستخدم أزرارًا مبهمة", () => {
    const quiz = read("app/components/exercise/QuizExperienceViews.tsx");
    expect(quiz).toContain("إعادة الاختبار من البداية");
    expect(quiz).toContain("تدرّب على أخطائك");
  });

  test("لعبة من معي تصرح بأن المبني قد يكون له محل", () => {
    const game = read("app/components/WhoIsWithMeGame.tsx");
    expect(game).toContain("هذا لا يلغي محلها الإعرابي");
    expect(game).toContain("في محل رفع أو نصب أو جر");
  });

  test("علامتي تصف الاسم المبني بالمحل لا بالحركة", () => {
    const game = read("content/games/markati.ts");
    expect(game).toContain('caseLabel: "في محل جر"');
    expect(game).toContain("اسم إشارة مبني في محل جر بحرف الجر");
  });

  test("شبه الجملة غير محصورة في الخبر", () => {
    const glossary = read("app/components/exercise/ExerciseSharedViews.tsx");
    expect(glossary).toContain("خبرًا أو نعتًا أو حالًا");
  });
});
