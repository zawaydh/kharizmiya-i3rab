import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(process.cwd());
const read = (path: string) => readFileSync(resolve(root, path), "utf8");

describe("تصحيحات الإصدار النهائي", () => {
  it("يحفظ رابط الصفحة كاملًا مع معاملات الاستعلام عند تسجيل الدخول", () => {
    const source = read("app/components/AuthLockGate.tsx");
    expect(source).toContain("useSearchParams");
    expect(source).toContain("searchParams.toString()");
    expect(source).toContain("encodeURIComponent(destination)");
  });

  it("يصف التسجيل كما يعمل فعليًا دون وعد متناقض", () => {
    const gate = read("app/components/AuthLockGate.tsx");
    const auth = read("app/auth/page.tsx");
    expect(gate).toContain("التسجيل مطلوب للدخول إلى المراحل التفاعلية");
    expect(auth).toContain("التسجيل مطلوب للدخول إلى التعلّم الموجّه");
    expect(gate).not.toContain("ليس لفتح محتوى مختلف");
    expect(auth).not.toContain("يمكنك التعلّم بالمحتوى نفسه");
  });

  it("لا يحذف المسافات من كلمة المرور", () => {
    const source = read("app/auth/page.tsx");
    expect(source).not.toContain("password.trim()");
    expect(source).toContain("const rawPassword = password");
  });

  it("لا يستخدم روابط # للمراحل المقفلة", () => {
    const source = read("app/dashboard/page.tsx");
    expect(source).not.toContain('href="#"');
    expect(source).toContain("<button");
    expect(source).toContain("disabled");
  });

  it("يستخدم تاريخ استحقاق ثابتًا للشهادة ولا يستخدم تاريخ فتح الصفحة", () => {
    const source = read("app/certificate/CertificateClient.tsx");
    expect(source).toContain("certificate_earned_at || row?.updated_at");
    expect(source).not.toContain("new Date().toLocaleDateString");
    expect(source).not.toContain('|| "nominal-advanced"');
  });

  it("يحفظ التقدم بقفل تفاؤلي ولا يكتب فوق جلسة أحدث", () => {
    const source = read("lib/server/progressRepository.ts");
    expect(source).toContain('.eq("updated_at", existing.updated_at)');
    expect(source).toContain("maxAttempts = 5");
    expect(source).toContain("PROGRESS_CONFLICT_RETRY_EXHAUSTED");
  });

  it("يعرض الإعراب الكامل للمثال داخل نتيجة المسار البصري", () => {
    const source = read("app/components/DynamicPathTree.tsx");
    expect(source).toContain("example?.facts?.finalI3rab");
    expect(source).toContain("String(example.facts.finalI3rab)");
  });

  it("يربط حقول الحساب بعناوينها ويحدد نوع كل زر", () => {
    const auth = read("app/auth/page.tsx");
    expect(auth).toContain('htmlFor="auth-email"');
    expect(auth).toContain('id="auth-email"');
    expect(auth).toContain('htmlFor="auth-password"');
    expect(auth).toContain('id="auth-password"');

    const appFiles = [
      "app/components/ExercisePlayer.tsx",
      "app/components/InteractiveLearning.tsx",
      "app/certificate/CertificateClient.tsx",
      "app/auth/page.tsx",
      "app/auth/reset-password/page.tsx",
      "app/components/exercise/ExerciseSharedViews.tsx",
      "app/components/exercise/QuizExperienceViews.tsx",
    ];
    for (const file of appFiles) {
      const source = read(file);
      const buttons = source.match(/<button\b[^>]*>/gs) || [];
      expect(buttons.every((button) => /\btype=/.test(button)), `${file}: زر بلا type`).toBe(true);
    }
  });

  it("يوفر إظهار وإخفاء كلمة المرور دون إضافة CSS جديد", () => {
    const auth = read("app/auth/page.tsx");
    const reset = read("app/auth/reset-password/page.tsx");

    expect(auth).toContain("AUTH_PASSWORD_VISIBILITY_V3");
    expect(auth).toContain('type={showPassword ? "text" : "password"}');
    expect(auth).toContain("إظهار كلمة المرور");
    expect(auth).toContain("إخفاء كلمة المرور");
    expect(auth).toContain('aria-controls="auth-password"');

    expect(reset).toContain('type={showPassword ? "text" : "password"}');
    expect(reset).toContain('type={showConfirmation ? "text" : "password"}');
    expect(reset).toContain('aria-controls="new-password"');
    expect(reset).toContain('aria-controls="confirm-new-password"');
    expect(reset).toContain("إظهار كلمة المرور");
  });
  it("يوفر استعادة كلمة المرور كاملة عبر Supabase", () => {
    const auth = read("app/auth/page.tsx");
    const reset = read("app/auth/reset-password/page.tsx");

    expect(auth).toContain("resetPasswordForEmail");
    expect(auth).toContain("نسيت كلمة المرور؟");
    expect(auth).toContain("/auth/reset-password");
    expect(reset).toContain("supabase.auth.updateUser({ password })");
    expect(reset).toContain("supabase.auth.signOut()");
    expect(reset).toContain("/auth?password_reset=success");
  });
  it("يعطي رابط الاستعادة أولوية على أي جلسة قديمة ويعرض الحساب المستهدف", () => {
    const callback = read("app/auth/callback/page.tsx");
    const reset = read("app/auth/reset-password/page.tsx");

    expect(callback).toContain("let session = null");
    expect(callback).toContain("if (hashTokens)");
    expect(callback).toContain("else if (code)");
    expect(callback).not.toContain("let session = await getExistingSession()");

    expect(reset).toContain('autoComplete="username"');
    expect(reset).toContain("الحساب الذي ستتغير كلمة مروره");
    expect(reset).toContain("setRecoveryEmail(data.session.user.email");
  });
  it("يطابق تعريف React إصدار التشغيل", () => {
    const packageJson = JSON.parse(read("package.json"));
    expect(packageJson.dependencies.react).toBe("18.3.1");
    expect(packageJson.devDependencies["@types/react"]).toMatch(/^18\./);
  });

  it("يعرض حروف العطف كاملة ويجعل قرينة قابلة للنقر عبر قاموس الموقع", () => {
    const hints = read("app/components/exercise/TawabiStudentHints.ts");
    const feedback = read("app/components/exercise/TawabiChoiceFeedback.ts");
    const textViews = read("app/components/exercise/ExerciseTextViews.tsx");
    const sharedViews = read("app/components/exercise/ExerciseSharedViews.tsx");

    const conjunctions = "الواو، الفاء، ثم، أو، أم، بل، لا، لكن، حتى؛ وهذه قرينتك";
    expect(hints).toContain(conjunctions);
    expect(feedback).toContain(conjunctions);

    expect(sharedViews).toContain('"قرينة": { title: "القرينة"');
    expect(sharedViews).toContain('"قرينتك": { title: "القرينة"');
    expect(sharedViews).toContain("تعني هنا: دليلك");
    expect(textViews).toContain('className="smart-term"');
    expect(textViews).toContain("onClick={() => onTerm?.(part)}");
    expect(textViews).not.toContain("INLINE_MEANING_HELP_V18");
    expect(textViews).not.toContain("InlineMeaningTerm");
  });
});
