"use client";

import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PLATFORM_NAME } from "../../../lib/brand";
import { hasSupabaseEnv, supabase } from "../../../lib/supabaseClient";

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error || "");
}

export default function ResetPasswordPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [ready, setReady] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;

    async function checkRecoverySession() {
      if (!hasSupabaseEnv) {
        if (active) {
          setMessage("إعدادات Supabase غير موجودة في الموقع.");
          setChecking(false);
        }
        return;
      }

      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        if (!active) return;

        if (!data?.session?.user) {
          setMessage("رابط استعادة كلمة المرور غير صالح أو انتهت صلاحيته. اطلب رابطًا جديدًا من صفحة الدخول.");
          setReady(false);
        } else {
          setRecoveryEmail(data.session.user.email ?? "");
          setReady(true);
        }
      } catch (error) {
        if (!active) return;
        setMessage(errorMessage(error) || "تعذر التحقق من رابط الاستعادة.");
        setReady(false);
      } finally {
        if (active) setChecking(false);
      }
    }

    checkRecoverySession();

    return () => {
      active = false;
    };
  }, []);

  async function handleUpdatePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (password.length < 6) {
      setMessage("كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل.");
      return;
    }

    if (password !== confirmation) {
      setMessage("كلمتا المرور غير متطابقتين.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;

      // End the temporary recovery session, then require a normal login
      // with the newly chosen password.
      await supabase.auth.signOut();
      router.replace("/auth?password_reset=success");
    } catch (error) {
      setMessage(errorMessage(error) || "تعذر تغيير كلمة المرور.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-modern-page">
      <section className="card auth-modern-hero card-glow">
        <div className="auth-modern-copy">
          <div className="section-kicker">{PLATFORM_NAME}</div>
          <h1 className="h1">تعيين كلمة مرور جديدة</h1>
          <p className="p">
            اختر كلمة مرور جديدة لحسابك. بعد الحفظ ستعود إلى صفحة الدخول وتستخدمها بشكل طبيعي.
          </p>
        </div>

        <div className="card auth-modern-card">
          {checking ? (
            <div className="auth-logged-box">
              <div className="auth-logged-icon">…</div>
              <h2>جارٍ التحقق من رابط الاستعادة</h2>
              <p className="p">انتظر لحظة.</p>
            </div>
          ) : ready ? (
            <form className="auth-form-modern" onSubmit={handleUpdatePassword}>
              <div className="auth-field">
                <label htmlFor="recovery-email">الحساب الذي ستتغير كلمة مروره</label>
                <input
                  id="recovery-email"
                  className="input"
                  type="email"
                  autoComplete="username"
                  readOnly
                  value={recoveryEmail}
                  dir="ltr"
                />
              </div>

              <div className="auth-field">
                <label htmlFor="new-password">كلمة المرور الجديدة</label>
                <input
                  id="new-password"
                  className="input"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  minLength={6}
                  required
                  value={password}
                  onChange={(event: ChangeEvent<HTMLInputElement>) => setPassword(event.target.value)}
                  placeholder="6 أحرف على الأقل"
                  dir="ltr"
                />
                <button
                  type="button"
                  className="btn btn-soft"
                  onClick={() => setShowPassword((visible) => !visible)}
                  aria-pressed={showPassword}
                  aria-controls="new-password"
                >
                  {showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                </button>
              </div>

              <div className="auth-field">
                <label htmlFor="confirm-new-password">تأكيد كلمة المرور</label>
                <input
                  id="confirm-new-password"
                  className="input"
                  type={showConfirmation ? "text" : "password"}
                  autoComplete="new-password"
                  minLength={6}
                  required
                  value={confirmation}
                  onChange={(event: ChangeEvent<HTMLInputElement>) => setConfirmation(event.target.value)}
                  placeholder="أعد كتابة كلمة المرور"
                  dir="ltr"
                />
                <button
                  type="button"
                  className="btn btn-soft"
                  onClick={() => setShowConfirmation((visible) => !visible)}
                  aria-pressed={showConfirmation}
                  aria-controls="confirm-new-password"
                >
                  {showConfirmation ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                </button>
              </div>

              <button type="submit" className="btn btn-primary auth-submit-btn" disabled={loading}>
                {loading ? "جارٍ حفظ كلمة المرور..." : "حفظ كلمة المرور الجديدة"}
              </button>

              {message ? <div className="auth-note-box">{message}</div> : null}
            </form>
          ) : (
            <div className="auth-logged-box">
              <div className="auth-logged-icon">!</div>
              <h2>تعذر فتح رابط الاستعادة</h2>
              <p className="p">{message}</p>
              <div className="auth-actions-stack">
                <Link className="btn btn-primary" href="/auth">العودة إلى صفحة الدخول</Link>
                <Link className="btn btn-soft" href="/">العودة للرئيسية</Link>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}