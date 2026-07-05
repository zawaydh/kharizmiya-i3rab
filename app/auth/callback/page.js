"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { hasSupabaseEnv, supabase } from "../../../lib/supabaseClient";

const DEFAULT_NEXT_URL = "/topics?welcome=1";
const PENDING_NAME_KEY = "khwarizmia_pending_full_name";
const PENDING_NEXT_KEY = "khwarizmia_pending_next_url";

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function isSafeInternalUrl(value) {
  return Boolean(value && value.startsWith("/") && !value.startsWith("//"));
}

function getSafeNext() {
  if (typeof window === "undefined") return DEFAULT_NEXT_URL;
  const params = new URLSearchParams(window.location.search);
  const fromUrl = params.get("next");
  const fromStorage = localStorage.getItem(PENDING_NEXT_KEY);
  if (isSafeInternalUrl(fromUrl)) return fromUrl;
  if (isSafeInternalUrl(fromStorage)) return fromStorage;
  return DEFAULT_NEXT_URL;
}

function getVerifiedAt(user) {
  return user?.email_confirmed_at || user?.confirmed_at || new Date().toISOString();
}

function getNameFromUser(user) {
  return user?.user_metadata?.full_name?.trim?.() || "";
}

async function waitForSession() {
  for (let i = 0; i < 6; i += 1) {
    const { data } = await supabase.auth.getSession();
    if (data?.session?.user) return data.session;
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  return null;
}

async function trySyncStudentRow(user, fullName) {
  if (!user?.id || !user?.email) return;

  const payload = {
    auth_user_id: user.id,
    full_name: fullName || getNameFromUser(user) || null,
    email: normalizeEmail(user.email),
    email_verified: true,
    email_verified_at: getVerifiedAt(user),
    updated_at: new Date().toISOString(),
  };

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

export default function AuthCallbackPage() {
  const router = useRouter();
  const [message, setMessage] = useState("جارٍ تأكيد البريد والدخول...");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function completeLogin() {
      if (!hasSupabaseEnv) {
        setError("إعدادات Supabase غير موجودة في Vercel.");
        return;
      }

      const targetNext = getSafeNext();

      try {
        const params = new URLSearchParams(window.location.search);
        const authError = params.get("error_description") || params.get("error");
        if (authError) throw new Error(authError);

        const code = params.get("code");
        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) throw exchangeError;
        } else if (window.location.hash) {
          const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
          const accessToken = hashParams.get("access_token");
          const refreshToken = hashParams.get("refresh_token");
          if (accessToken && refreshToken) {
            const { error: sessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
            if (sessionError) throw sessionError;
          }
        }

        const session = await waitForSession();
        const user = session?.user;
        if (!user) {
          throw new Error("لم تكتمل جلسة الدخول. افتحي آخر رسالة تحقق فقط أو أرسلي رابطًا جديدًا.");
        }

        const pendingName = localStorage.getItem(PENDING_NAME_KEY)?.trim?.() || "";
        const currentName = getNameFromUser(user);
        const finalName = pendingName || currentName;

        if (pendingName && pendingName !== currentName) {
          await supabase.auth.updateUser({ data: { full_name: pendingName } });
        }

        await trySyncStudentRow(user, finalName);

        localStorage.removeItem(PENDING_NAME_KEY);
        localStorage.removeItem(PENDING_NEXT_KEY);

        if (!active) return;
        setMessage("تم تأكيد البريد. جارٍ تحويلك...");
        window.history.replaceState({}, document.title, "/auth/callback");
        router.replace(targetNext);
      } catch (err) {
        if (!active) return;
        console.error("auth callback failed", err);
        setError(err?.message || "تعذر تأكيد رابط الدخول.");
      }
    }

    completeLogin();

    return () => {
      active = false;
    };
  }, [router]);

  return (
    <div className="auth-modern-page">
      <section className="card auth-modern-hero card-glow">
        <div className="auth-modern-copy">
          <div className="section-kicker">خوارزمية الإعراب</div>
          <h1 className="h1">تأكيد البريد</h1>
          <p className="p">
            {error ? "لم يكتمل الدخول عبر الرابط." : message}
          </p>
        </div>
        <div className="card auth-modern-card">
          {error ? (
            <div className="auth-logged-box">
              <div className="auth-logged-icon">!</div>
              <h2>الرابط لم يكتمل</h2>
              <p className="p">{error}</p>
              <div className="auth-actions-stack">
                <a className="btn btn-primary" href="/auth">إرسال رابط جديد</a>
                <a className="btn btn-soft" href="/">العودة للرئيسية</a>
              </div>
            </div>
          ) : (
            <div className="auth-logged-box">
              <div className="auth-logged-icon">…</div>
              <h2>جارٍ الدخول</h2>
              <p className="p">انتظري لحظة، لا تغلقي الصفحة.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
