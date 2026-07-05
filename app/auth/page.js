"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { hasSupabaseEnv, supabase } from "../../lib/supabaseClient";

const DEFAULT_NEXT_URL = "/topics?welcome=1";
const PENDING_NAME_KEY = "khwarizmia_pending_full_name";
const PENDING_NEXT_KEY = "khwarizmia_pending_next_url";

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function isSafeInternalUrl(value) {
  return Boolean(value && value.startsWith("/") && !value.startsWith("//"));
}

function getSafeNextFromSearch() {
  if (typeof window === "undefined") return DEFAULT_NEXT_URL;
  const params = new URLSearchParams(window.location.search);
  const requestedNext = params.get("next");
  return isSafeInternalUrl(requestedNext) ? requestedNext : DEFAULT_NEXT_URL;
}

function getVerifiedAt(user) {
  return user?.email_confirmed_at || user?.confirmed_at || null;
}

function getNameFromUser(user) {
  return user?.user_metadata?.full_name?.trim?.() || "";
}

async function trySyncStudentRow(user, fullName) {
  if (!user?.id || !user?.email) return;

  const verifiedAt = getVerifiedAt(user) || new Date().toISOString();
  const payload = {
    auth_user_id: user.id,
    full_name: fullName || getNameFromUser(user) || null,
    email: normalizeEmail(user.email),
    email_verified: true,
    email_verified_at: verifiedAt,
    updated_at: new Date().toISOString(),
  };

  // هذا الربط اختياري: إذا كان جدول students أو الأعمدة الجديدة غير موجودة لن نمنع الدخول.
  try {
    const claimOldRow = await supabase
      .from("students")
      .update(payload)
      .eq("email", payload.email)
      .is("auth_user_id", null)
      .select("id")
      .maybeSingle();

    if (!claimOldRow.error && claimOldRow.data) return;

    const { error } = await supabase
      .from("students")
      .upsert(payload, { onConflict: "auth_user_id" });

    if (error) {
      console.warn("students sync skipped:", error.message);
    }
  } catch (error) {
    console.warn("students sync skipped:", error?.message || error);
  }
}

export default function AuthPage() {
  const router = useRouter();
  const [nextUrl, setNextUrl] = useState(DEFAULT_NEXT_URL);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [msg, setMsg] = useState(null);
  const [userEmail, setUserEmail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [linkSent, setLinkSent] = useState(false);

  const redirectTo = useMemo(() => {
    if (typeof window === "undefined") return undefined;
    return `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextUrl)}`;
  }, [nextUrl]);

  useEffect(() => {
    const safeNext = getSafeNextFromSearch();
    setNextUrl(safeNext);

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

        const verifiedAt = getVerifiedAt(user);
        const pendingName = typeof window !== "undefined" ? localStorage.getItem(PENDING_NAME_KEY) : "";
        const pendingNext = typeof window !== "undefined" ? localStorage.getItem(PENDING_NEXT_KEY) : "";
        const targetNext = isSafeInternalUrl(pendingNext) ? pendingNext : safeNext;
        const currentName = getNameFromUser(user);
        const finalName = pendingName?.trim?.() || currentName;

        if (pendingName && pendingName.trim() && pendingName.trim() !== currentName) {
          await supabase.auth.updateUser({
            data: { full_name: pendingName.trim() },
          });
        }

        if (verifiedAt || user.email) {
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
      listener?.data?.subscription?.unsubscribe?.();
      listener?.unsubscribe?.();
    };
  }, [router]);

  async function handleSendMagicLink(e) {
    e.preventDefault();
    setMsg(null);

    const cleanEmail = normalizeEmail(email);
    const cleanName = fullName.trim();

    if (!hasSupabaseEnv) {
      setMsg("إعدادات Supabase غير موجودة: NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY");
      return;
    }

    if (!cleanName) {
      setMsg("اكتبي الاسم الكامل كما سيظهر في الشهادة.");
      return;
    }

    if (!cleanEmail || !cleanEmail.includes("@") || !cleanEmail.includes(".")) {
      setMsg("اكتبي بريدًا إلكترونيًا صحيح الشكل.");
      return;
    }

    setLoading(true);

    try {
      localStorage.setItem(PENDING_NAME_KEY, cleanName);
      localStorage.setItem(PENDING_NEXT_KEY, nextUrl);

      const { error } = await supabase.auth.signInWithOtp({
        email: cleanEmail,
        options: {
          shouldCreateUser: true,
          emailRedirectTo: redirectTo,
          data: { full_name: cleanName },
        },
      });

      if (error) throw error;

      setEmail(cleanEmail);
      setLinkSent(true);
      setMsg("تم إرسال رابط الدخول. افتحي آخر رسالة في بريدك واضغطي الرابط، ثم سيعود بك إلى الموقع تلقائيًا.");
    } catch (err) {
      const m = err?.message || String(err);
      setMsg("تعذر إرسال رابط التحقق: " + m);
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
          <div className="section-kicker">تحقق بالبريد فقط</div>
          <h1 className="h1">ادخلي ببريد حقيقي</h1>
          <p className="p">
            لا نحتاج كلمة مرور. اكتبي اسمك وبريدك، ثم افتحي الرابط الذي يصلك على البريد. بهذه
            الطريقة لا يُقبَل البريد إلا إذا كان حقيقيًا وتملكين الوصول إليه.
          </p>

          <div className="auth-benefits-grid">
            <div className="auth-benefit-card">
              <strong>بريد موثّق</strong>
              <span>الدخول يتم فقط بعد فتح الرابط المرسل إلى البريد.</span>
            </div>
            <div className="auth-benefit-card">
              <strong>حفظ التقدم</strong>
              <span>يرتبط إنجازك بحساب Supabase الحقيقي.</span>
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
              <p className="p">انتظري لحظة.</p>
            </div>
          ) : userEmail ? (
            <div className="auth-logged-box">
              <div className="auth-logged-icon">✓</div>
              <h2>تم تسجيل الدخول</h2>
              <span className="pill pill-accent">{userEmail}</span>
              <p className="p">هذا البريد تم فتح رابط التحقق منه.</p>
              <div className="auth-actions-stack">
                <a className="btn btn-primary" href={nextUrl}>{nextUrl === DEFAULT_NEXT_URL ? "اختر موضوعًا" : "متابعة الموضوع"}</a>
                <a className="btn btn-soft" href="/dashboard">لوحة التقدم</a>
                <button className="btn btn-danger" onClick={handleLogout} disabled={loading}>
                  {loading ? "جارٍ الخروج..." : "خروج"}
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSendMagicLink} className="auth-form-modern">
              <div className="auth-field">
                <label>الاسم الكامل</label>
                <input
                  className="input"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="اكتبي الاسم الذي سيظهر في الشهادة"
                />
              </div>

              <div className="auth-field">
                <label>البريد الإلكتروني</label>
                <input
                  className="input"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@email.com"
                  dir="ltr"
                />
              </div>

              <button className="btn btn-primary auth-submit-btn" type="submit" disabled={loading}>
                {loading ? "جارٍ إرسال الرابط..." : linkSent ? "إرسال رابط الدخول مرة أخرى" : "إرسال رابط الدخول إلى بريدي"}
              </button>

              {linkSent ? (
                <div className="auth-note-box auth-note-success">
                  افحصي البريد الوارد، وإذا لم يظهر الرابط افحصي الرسائل غير المرغوب فيها. استخدمي آخر رسالة فقط، ولا تستخدمي رسائل قديمة.
                </div>
              ) : null}
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
