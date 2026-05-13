"use client";

import { useMemo, useState } from "react";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import TopicDropdown from "./TopicDropdown";
import { useAuthUser } from "./useAuthUser";
import { supabase } from "../../lib/supabaseClient";

function getDisplayName(user) {
  const fullName = user?.user_metadata?.full_name?.trim?.();
  if (fullName) return fullName;
  const email = user?.email || "";
  if (email.includes("@")) return email.split("@")[0];
  return "الحساب";
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuthUser();
  const locked = !isLoading && !isAuthenticated;
  const accountLabel = "حسابي";
  const accountHref = !isLoading && isAuthenticated ? "/dashboard" : "/auth";
  const protectedHref = (href) => (locked ? "/auth" : href);

  const currentTopicCode = useMemo(() => {
    const queryTopic = searchParams.get("topic");
    if (queryTopic) return queryTopic;
    const segments = (pathname || "").split("/").filter(Boolean);
    if (segments.length >= 2 && ["learn", "train", "quiz"].includes(segments[0])) return segments[1];
    return undefined;
  }, [pathname, searchParams]);

  async function logout() {
    await supabase.auth.signOut();
    setOpen(false);
    router.push("/");
  }

  return (
    <header className="nav-clean nav-modern-shell nav-final-shell luxe-navbar">
      <div className="nav-clean-inner nav-final-inner luxe-nav-inner">
        <a href="/" className="luxe-nav-brand" aria-label="العودة إلى الصفحة الرئيسية">
          <img src="/brand-icon.svg" alt="أيقونة خوارزمية الإعراب" className="luxe-nav-icon" />
          <span>خوارزمية الإعراب</span>
        </a>

        <nav className="desktop-links nav-final-links luxe-desktop-nav" aria-label="التنقل الرئيسي">
          <a href="/">الرئيسية</a>
          <a href={protectedHref("/dashboard")} aria-disabled={locked}>لوحتي</a>
          <TopicDropdown compact currentCode={currentTopicCode} buttonLabel="الموضوعات" locked={locked} />
          <TopicDropdown compact currentCode={currentTopicCode} buttonLabel="مسارات" locked={locked} mode="paths" />
          <a href={accountHref} className="login-link nav-account-chip">{accountLabel}</a>
          {isAuthenticated ? <button type="button" className="nav-logout-btn" onClick={logout}>خروج</button> : null}
        </nav>

        <button type="button" className="menu-btn nav-final-menu-btn luxe-menu-btn" onClick={() => setOpen((v) => !v)} aria-label="فتح القائمة" aria-expanded={open}>☰</button>

        <nav className={`mobile-menu-clean nav-final-mobile-menu luxe-mobile-menu ${open ? "open" : ""}`}>
          <a href="/" onClick={() => setOpen(false)}>الرئيسية</a>
          <a href={protectedHref("/dashboard")} onClick={() => setOpen(false)} aria-disabled={locked}>لوحتي</a>
          <TopicDropdown currentCode={currentTopicCode} buttonLabel="الموضوعات" className="mobile-topic-dropdown" locked={locked} onNavigate={() => setOpen(false)} />
          <TopicDropdown currentCode={currentTopicCode} buttonLabel="مسارات" className="mobile-topic-dropdown" locked={locked} mode="paths" onNavigate={() => setOpen(false)} />
          <a href={accountHref} onClick={() => setOpen(false)} className="login-link mobile-login nav-account-chip">{accountLabel}</a>
          {isAuthenticated ? <button type="button" className="nav-logout-btn mobile-logout" onClick={logout}>تسجيل الخروج</button> : null}
        </nav>
      </div>
    </header>
  );
}
