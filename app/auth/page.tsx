"use client";

import { Suspense, useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { hasSupabaseEnv, supabase } from "../../lib/supabaseClient";
import {
  DEFAULT_NEXT_URL,
  PENDING_NAME_KEY,
  PENDING_NEXT_KEY,
  getNameFromUser,
  getVerifiedAt,
  isSafeInternalUrl,
  normalizeEmail,
  trySyncStudentRow,
} from "../../lib/authHelpers";

function friendlyAuthError(message: unknown): string {
  const text = String(message || "").toLowerCase();
  if (text.includes("invalid login credentials")) {
    return "بيانات الدخول غير صحيحة. تأكد من البريد وكلمة المرور.";
  }
  if (text.includes("email not confirmed") || text.includes("not confirmed")) {
    return "هذا البريد لم يتم تأكيده بعد. افتح رسالة التأكيد أولًا أو أعد إرسال رابط التأكيد.";
  }
  if (text.includes("already registered") || text.includes("user already")) {
    return "يوجد حساب بهذا البريد بالفعل. انتقل إلى تبويب الدخول، أو أعد إرسال رابط التأكيد إذا لم تكن قد أكدته.";
  }
  if (text.includes("password")) {
    return "تأكد من كلمة المرور. يجب أن تكون 6 أحرف على الأقل.";
  }
  return typeof message === "string" && message ? message : "حدث خطأ غير متوقع.";
}

type AuthMode = "login" | "signup";
type MessageType = "default" | "success";

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error || "");
}

function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedNext = searchParams.get("next");
  const nextUrl = isSafeInternalUrl(requestedNext) ? requestedNext : DEFAULT_NEXT_URL;
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [msgType, setMsgType] = useState<MessageType>("default");
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [confirmationSent, setConfirmationSent] = useState(false);

  const redirectTo = useMemo(() => {
    if (typeof window === "undefined") return undefined;
    return `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextUrl)}`;
  }, [nextUrl]);

  function showMessage(text: string | null, type: MessageType = "default") {
    setMsg(text);
    setMsgType(type);
  }

  useEffect(() => {
    let active = true;

    async function finalizeSession() {
      try {
        const { data } = await supabase.auth.getUser();
        if (!active) return;

        const user = data?.user ?? null;
        if (!user) {
          setCheckingSession(false);
          return;
        }

        const pendingName = typeof window !== "undefined" ? localStorage.getItem(PENDING_NAME_KEY) : "";
        const pendingNext = typeof window !== "undefined" ? localStorage.getItem(PENDING_NEXT_KEY) : "";
        const targetNext = isSafeInternalUrl(pendingNext) ? pendingNext : nextUrl;
        const currentName = getNameFromUser(user);
        const finalName = pendingName?.trim?.() || currentName;

        if (pendingName && pendingName.trim() && pendingName.trim() !== currentName) {
          await supabase.auth.updateUser({
            data: { full_name: pendingName.trim() },
          });
        }

        if (getVerifiedAt(user)) {
          await trySyncStudentRow(user, finalName);
        }

        if (typeof window !== "undefined") {
          localStorage.removeItem(PENDING_NAME_KEY);
          localStorage.removeItem(PENDING_NEXT_KEY);
        }

        setUserEmail(user.email ?? null);
        setCheckingSession(false);

        if (targetNext && targetNext !== "/auth") {
          router.replace(targetNext);
        }
      } catch (error) {
        console.error("session finalize failed", error);
        if (active) setCheckingSession(false);
      }
    }

    finalizeSession();

    const listener = supabase.auth?.onAuthStateChange?.((_event, session) => {
      const user = session?.user;
      if (!active || !user) return;
      setUserEmail(user.email ?? null);
    });

    return () => {
      active = false;
      listener?.data?.subscription?.unsubscribe();
    };
  }, [nextUrl, router]);

  async function handleCreateAccount(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    showMessage(null);

    const cleanEmail = normalizeEmail(email);
    const cleanName = fullName.trim();
    const rawPassword = password;

    if (!hasSupabaseEnv) {
      showMessage("إعدادات Supabase غير موجودة: NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY");
      return;
    }

    if (!cleanName) {
      showMessage("اكتب الاسم الكامل كما سيظهر في الشهادة.");
      return;
    }

    if (!cleanEmail || !cleanEmail.includes("@") || !cleanEmail.includes(".")) {
      showMessage("اكتب بريدًا إلكترونيًا صحيح الشكل.");
      return;
    }

    if (rawPassword.length < 6) {
      showMessage("كلمة المرور يجب أن تكون 6 أحرف على الأقل.");
      return;
    }

    setLoading(true);

    try {
      localStorage.setItem(PENDING_NAME_KEY, cleanName);
      localStorage.setItem(PENDING_NEXT_KEY, nextUrl);

      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password: rawPassword,
        options: {
          emailRedirectTo: redirectTo,
          data: { full_name: cleanName },
        },
      });

      if (error) throw error;

      setEmail(cleanEmail);
      setConfirmationSent(true);

      if (data?.session?.user) {
        await trySyncStudentRow(data.session.user, cleanName);
        router.replace(nextUrl);
        return;
      }

      showMessage(
        "تم إنشاء الحساب. افتح رسالة تأكيد البريد واضغط الرابط. بعد التأكيد ستتمكن من تسجيل الدخول مباشرة بالبريد وكلمة المرور.",
        "success"
      );
    } catch (err) {
      showMessage(friendlyAuthError(errorMessage(err)));
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    showMessage(null);

    const cleanEmail = normalizeEmail(email);
    const rawPassword = password;

    if (!hasSupabaseEnv) {
      showMessage("إعدادات Supabase غير موجودة: NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY");
      return;
    }

    if (!cleanEmail || !cleanEmail.includes("@") || !cleanEmail.includes(".")) {
      showMessage("اكتب بريدًا إلكترونيًا صحيح الشكل.");
      return;
    }

    if (rawPassword.length === 0) {
      showMessage("اكتب كلمة المرور.");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: rawPassword,
      });

      if (error) throw error;

      const user = data?.user;
      if (!user) throw new Error("لم يكتمل تسجيل الدخول.");

      if (!getVerifiedAt(user)) {
        await supabase.auth.signOut();
        setUserEmail(null);
        showMessage("هذا البريد غير مؤكد بعد. افتح رسالة التأكيد أولًا أو أعد إرسال رابط التأكيد.");
        return;
      }

      await trySyncStudentRow(user, getNameFromUser(user));
      setUserEmail(user.email ?? null);
      router.replace(nextUrl);
    } catch (err) {
      showMessage(friendlyAuthError(errorMessage(err)));
    } finally {
      setLoading(false);
    }
  }

  async function handleResendConfirmation() {
    showMessage(null);
    const cleanEmail = normalizeEmail(email);

    if (!cleanEmail || !cleanEmail.includes("@") || !cleanEmail.includes(".")) {
      showMessage("اكتب البريد الإلكتروني أولًا، ثم أعد إرسال رابط التأكيد.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: cleanEmail,
        options: { emailRedirectTo: redirectTo },
      });
      if (error) throw error;
      setConfirmationSent(true);
      showMessage("تم إرسال رابط تأكيد جديد. استخدم آخر رسالة تصل إلى بريدك فقط.", "success");
    } catch (err) {
      showMessage("تعذر إرسال رابط التأكيد: " + friendlyAuthError(errorMessage(err)));
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    setLoading(true);
    try {
      await supabase.auth.signOut();
      setUserEmail(null);
      router.push("/");
    } catch {
      showMessage("تعذر تسجيل الخروج.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-modern-page">
      <section className="card auth-modern-hero card-glow">
        <div className="auth-modern-copy">
          <div className="section-kicker">حساب موثّق</div>
          <h1 className="h1">ادخل ببريدك المؤكد</h1>
          <p className="p">
            عند إنشاء الحساب فقط نرسل لك رابط تأكيد البريد. بعد تأكيده تستطيع الدخول في كل مرة
            بالبريد وكلمة المرور دون انتظار رابط جديد.
          </p>

          <div className="auth-purpose-note" role="note" aria-label="سبب التسجيل">
            <strong>تنبيه مهم</strong>
            <p>التسجيل مطلوب للدخول إلى التعلّم الموجّه والتدريب والاختبار النهائي، ولحفظ تقدمك ومعرفة المرحلة التي وصلتَ إليها وعرض إنجازك بوضوح في لوحتك.</p>
          </div>

          <div className="auth-benefits-grid">
            <div className="auth-benefit-card">
              <strong>تأكيد مرة واحدة</strong>
              <span>يُرسل رابط التأكيد عند إنشاء الحساب فقط.</span>
            </div>
            <div className="auth-benefit-card">
              <strong>دخول طبيعي</strong>
              <span>بعد التأكيد تدخل بالبريد وكلمة المرور.</span>
            </div>
            <div className="auth-benefit-card">
              <strong>شهادة إنجاز</strong>
              <span>يُستخدم الاسم المدخل في لوحة التقدم والشهادة.</span>
            </div>
          </div>
        </div>

        <div className="card auth-modern-card">
          {checkingSession ? (
            <div className="auth-logged-box">
              <div className="auth-logged-icon">…</div>
              <h2>جارٍ التحقق من الحساب</h2>
              <p className="p">انتظر لحظة.</p>
            </div>
          ) : userEmail ? (
            <div className="auth-logged-box">
              <div className="auth-logged-icon">✓</div>
              <h2>تم تسجيل الدخول</h2>
              <span className="pill pill-accent">{userEmail}</span>
              <p className="p">هذا الحساب موثّق ويمكنه حفظ التقدم.</p>
              <div className="auth-actions-stack">
                <a className="btn btn-primary" href={nextUrl}>{nextUrl === DEFAULT_NEXT_URL ? "اختر موضوعًا" : "متابعة الموضوع"}</a>
                <a className="btn btn-soft" href="/dashboard">لوحة التقدم</a>
                <button type="button" className="btn btn-danger" onClick={handleLogout} disabled={loading}>
                  {loading ? "جارٍ الخروج..." : "خروج"}
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="auth-tabs-modern" role="tablist" aria-label="اختيار طريقة الحساب">
                <button
                  type="button"
                  className={`auth-tab ${mode === "login" ? "is-active" : ""}`}
                  onClick={() => {
                    setMode("login");
                    showMessage(null);
                  }}
                >
                  دخول
                </button>
                <button
                  type="button"
                  className={`auth-tab ${mode === "signup" ? "is-active" : ""}`}
                  onClick={() => {
                    setMode("signup");
                    showMessage(null);
                  }}
                >
                  إنشاء حساب
                </button>
              </div>

              <form onSubmit={mode === "signup" ? handleCreateAccount : handleLogin} className="auth-form-modern">
                {mode === "signup" ? (
                  <div className="auth-field">
                    <label htmlFor="auth-full-name">الاسم الكامل</label>
                    <input
                      id="auth-full-name"
                      className="input"
                      autoComplete="name"
                      required
                      value={fullName}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setFullName(e.target.value)}
                      placeholder="اكتب الاسم الذي سيظهر في الشهادة"
                    />
                  </div>
                ) : null}

                <div className="auth-field">
                  <label htmlFor="auth-email">البريد الإلكتروني</label>
                  <input
                    id="auth-email"
                    className="input"
                    autoComplete="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                    placeholder="example@email.com"
                    dir="ltr"
                  />
                </div>

                <div className="auth-field">
                  <label htmlFor="auth-password">كلمة المرور</label>
                  <input
                    id="auth-password"
                    className="input"
                    autoComplete={mode === "signup" ? "new-password" : "current-password"}
                    type="password"
                    required
                    value={password}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                    placeholder={mode === "signup" ? "6 أحرف على الأقل" : "كلمة المرور"}
                    dir="ltr"
                  />
                </div>

                <button className="btn btn-primary auth-submit-btn" type="submit" disabled={loading}>
                  {loading
                    ? "جارٍ المعالجة..."
                    : mode === "signup"
                      ? confirmationSent
                        ? "إنشاء الحساب وإرسال تأكيد جديد"
                        : "إنشاء الحساب وإرسال التأكيد"
                      : "تسجيل الدخول"}
                </button>

                {mode === "login" ? (
                  <button
                    type="button"
                    className="btn btn-soft auth-submit-btn"
                    onClick={handleResendConfirmation}
                    disabled={loading}
                  >
                    إعادة إرسال رابط التأكيد
                  </button>
                ) : null}

                {confirmationSent ? (
                  <div className="auth-note-box auth-note-success">
                    افحص البريد الوارد، وإذا لم تظهر الرسالة افحص الرسائل غير المرغوب فيها. استخدم آخر رسالة فقط.
                  </div>
                ) : null}
              </form>
            </>
          )}

          {!hasSupabaseEnv ? (
            <div className="auth-note-box auth-note-warning">
              تنبيه: إعدادات Supabase غير موجودة حاليًا، لذلك لن يعمل تسجيل الدخول حتى تضيف ملف البيئة.
            </div>
          ) : null}

          {msg ? <div className={`auth-note-box ${msgType === "success" ? "auth-note-success" : ""}`}>{msg}</div> : null}
        </div>
      </section>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="card auth-modern-card">جارٍ تجهيز صفحة الدخول...</div>}>
      <AuthForm />
    </Suspense>
  );
}
