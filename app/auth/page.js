"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { hasSupabaseEnv, supabase } from "../../lib/supabaseClient";

export default function AuthPage() {
  const router = useRouter();
  const [nextUrl, setNextUrl] = useState("/topics?welcome=1");
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [msg, setMsg] = useState(null);
  const [userEmail, setUserEmail] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requestedNext = params.get("next");
    if (requestedNext && requestedNext.startsWith("/")) setNextUrl(requestedNext);

    let active = true;
    supabase.auth.getUser().then(({ data }) => {
      if (!active) return;
      setUserEmail(data?.user?.email ?? null);
    });
    return () => {
      active = false;
    };
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setMsg(null);
    setLoading(true);

    try {
      if (!hasSupabaseEnv) {
        throw new Error("SUPABASE_ENV_MISSING");
      }

      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName || null },
          },
        });

        if (error) throw error;

        if (data?.session) {
          router.push(nextUrl);
          return;
        }

        setMsg("تم إنشاء الحساب. إذا كان تأكيد البريد مفعّلًا فافحص بريدك ثم سجّل الدخول.");
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        setUserEmail(data?.user?.email ?? null);
        router.push(nextUrl);
        return;
      }
    } catch (err) {
      const m = err?.message || String(err);
      setMsg(
        m === "SUPABASE_ENV_MISSING"
          ? "المتغيرات غير مضبوطة: NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY"
          : "خطأ: " + m
      );
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
      setMsg("تعذر تسجيل الخروج.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-modern-page">
      <section className="card auth-modern-hero card-glow">
        <div className="auth-modern-copy">
          <div className="section-kicker">دخول سريع وآمن</div>
          <h1 className="h1">ابدأ رحلتك التعليمية</h1>
          <p className="p">
            بعد تسجيل الدخول ستنتقل مباشرة إلى صفحة <strong>اختر موضوعًا</strong> لتبدأ المسار
            المناسب، ثم تحفظ تقدمك خطوة بخطوة.
          </p>

          <div className="auth-benefits-grid">
            <div className="auth-benefit-card">
              <strong>حفظ التقدم</strong>
              <span>يرتبط إنجازك بحسابك لتعود من حيث توقفت.</span>
            </div>
            <div className="auth-benefit-card">
              <strong>لوحة متابعة</strong>
              <span>تشاهد نسبة التعلّم والتدرّب والاختبار لكل موضوع.</span>
            </div>
            <div className="auth-benefit-card">
              <strong>شهادة إنجاز</strong>
              <span>تظهر عند استكمال المتطلبات والنجاح في الاختبار.</span>
            </div>
          </div>
        </div>

        <div className="card auth-modern-card">
          <div className="auth-tabs-modern">
            <button
              type="button"
              className={`auth-tab ${mode === "login" ? "is-active" : ""}`}
              onClick={() => setMode("login")}
            >
              دخول
            </button>
            <button
              type="button"
              className={`auth-tab ${mode === "signup" ? "is-active" : ""}`}
              onClick={() => setMode("signup")}
            >
              إنشاء حساب
            </button>
          </div>

          {userEmail ? (
            <div className="auth-logged-box">
              <div className="auth-logged-icon">✓</div>
              <h2>أنت مسجل الآن</h2>
              <span className="pill pill-accent">{userEmail}</span>
              <p className="p">يمكنك الذهاب مباشرة إلى اختيار الموضوع أو متابعة لوحة التقدم.</p>
              <div className="auth-actions-stack">
                <a className="btn btn-primary" href="/topics">اختر موضوعًا</a>
                <a className="btn btn-soft" href="/dashboard">لوحة التقدم</a>
                <button className="btn btn-danger" onClick={handleLogout} disabled={loading}>
                  {loading ? "جارٍ الخروج..." : "خروج"}
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="auth-form-modern">
              {mode === "signup" && (
                <div className="auth-field">
                  <label>الاسم</label>
                  <input
                    className="input"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="اكتب اسمك الذي سيظهر في الشهادة"
                  />
                </div>
              )}

              <div className="auth-field">
                <label>البريد الإلكتروني</label>
                <input
                  className="input"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@email.com"
                />
              </div>

              <div className="auth-field">
                <label>كلمة المرور</label>
                <input
                  className="input"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="أدخل كلمة المرور"
                />
              </div>

              <button className="btn btn-primary auth-submit-btn" type="submit" disabled={loading}>
                {loading ? "جارٍ التنفيذ..." : mode === "signup" ? "إنشاء الحساب" : "تسجيل الدخول"}
              </button>
            </form>
          )}

          {!hasSupabaseEnv ? (
            <div className="auth-note-box auth-note-warning">
              تنبيه: إعدادات Supabase غير موجودة حاليًا، لذلك لن يعمل تسجيل الدخول حتى تضيف ملف البيئة.
            </div>
          ) : null}

          {msg ? <div className="auth-note-box">{msg}</div> : null}
        </div>
      </section>
    </div>
  );
}
