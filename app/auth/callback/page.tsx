"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { hasSupabaseEnv, supabase } from "../../../lib/supabaseClient";
import { PLATFORM_NAME } from "../../../lib/brand";
import {
  DEFAULT_NEXT_URL,
  PENDING_NAME_KEY,
  PENDING_NEXT_KEY,
  getNameFromUser,
  isSafeInternalUrl,
  trySyncStudentRow,
} from "../../../lib/authHelpers";

function getSafeNext(): string {
  if (typeof window === "undefined") return DEFAULT_NEXT_URL;
  const params = new URLSearchParams(window.location.search);
  const fromUrl = params.get("next");
  const fromStorage = localStorage.getItem(PENDING_NEXT_KEY);
  if (isSafeInternalUrl(fromUrl)) return fromUrl;
  if (isSafeInternalUrl(fromStorage)) return fromStorage;
  return DEFAULT_NEXT_URL;
}
async function waitForSession() {
  for (let i = 0; i < 8; i += 1) {
    const { data } = await supabase.auth.getSession();
    if (data?.session?.user) return data.session;
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  return null;
}

async function getExistingSession() {
  const { data } = await supabase.auth.getSession();
  return data?.session?.user ? data.session : null;
}

function getHashTokens(): { access_token: string; refresh_token: string } | null {
  if (typeof window === "undefined" || !window.location.hash) return null;
  const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  const accessToken = hashParams.get("access_token");
  const refreshToken = hashParams.get("refresh_token");
  if (!accessToken || !refreshToken) return null;
  return { access_token: accessToken, refresh_token: refreshToken };
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error || "");
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

        // أحيانًا يفتح المتصفح صفحة callback بعد أن تكون الجلسة اكتملت بالفعل.
        // لذلك نتحقق من الجلسة أولًا حتى لا تظهر رسالة خطأ كاذبة.
        let session = await getExistingSession();

        const code = params.get("code");
        const hashTokens = getHashTokens();

        if (!session && hashTokens) {
          const { error: sessionError } = await supabase.auth.setSession(hashTokens);
          if (sessionError) {
            const recoveredSession = await getExistingSession();
            if (recoveredSession) session = recoveredSession;
            else throw sessionError;
          }
        }

        if (!session && code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) {
            const recoveredSession = await getExistingSession();
            if (recoveredSession) session = recoveredSession;
            else throw exchangeError;
          }
        }

        if (!session) {
          session = await waitForSession();
        }
        const user = session?.user;
        if (!user) {
          throw new Error("لم تكتمل جلسة الدخول. استخدم آخر رسالة فقط، أو عد إلى صفحة الدخول وأرسل رابطًا جديدًا.");
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
        setError(errorMessage(err) || "تعذر تأكيد رابط الدخول.");
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
          <div className="section-kicker">{PLATFORM_NAME}</div>
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
                <a className="btn btn-primary" href="/auth">العودة إلى صفحة الحساب</a>
                <Link className="btn btn-soft" href="/">العودة للرئيسية</Link>
              </div>
            </div>
          ) : (
            <div className="auth-logged-box">
              <div className="auth-logged-icon">…</div>
              <h2>جارٍ الدخول</h2>
              <p className="p">انتظر لحظة، لا تغلق الصفحة.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
