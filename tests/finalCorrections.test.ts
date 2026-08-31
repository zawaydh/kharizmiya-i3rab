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
  it("يطابق تعريف React إصدار التشغيل", () => {
    const packageJson = JSON.parse(read("package.json"));
    expect(packageJson.dependencies.react).toBe("18.3.1");
    expect(packageJson.devDependencies["@types/react"]).toMatch(/^18\./);
  });
});
