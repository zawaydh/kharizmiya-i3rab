"use client";

import { useMemo, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import TopicDropdown from "./TopicDropdown";
import { useAuthUser } from "./useAuthUser";

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
  const { user, isAuthenticated, isLoading } = useAuthUser();
  const locked = !isLoading && !isAuthenticated;
  const accountLabel = !isLoading && isAuthenticated ? `حسابي: ${getDisplayName(user)}` : "الحساب";
  const accountHref = !isLoading && isAuthenticated ? "/dashboard" : "/auth";
  const protectedHref = (href) => (locked ? "/auth" : href);

  const currentTopicCode = useMemo(() => {
    const queryTopic = searchParams.get("topic");
    if (queryTopic) return queryTopic;
    const segments = (pathname || "").split("/").filter(Boolean);
    if (segments.length >= 2 && ["learn", "train", "quiz"].includes(segments[0])) return segments[1];
    return undefined;
  }, [pathname, searchParams]);

  return (
    <header className="nav-clean nav-modern-shell nav-final-shell">
      <div className="nav-clean-inner nav-final-inner">
        <div className="nav-final-mobile-bar">
          <a href="/" className="brand-logo-link nav-final-logo-link nav-final-logo-badge" aria-label="العودة إلى الصفحة الرئيسية">
            <img src="/logo-khwarizmia-icon-new.png" alt="أيقونة خوارزمية الإعراب" className="brand-logo contain-logo nav-final-logo" />
          </a>
          <button type="button" className="menu-btn nav-final-menu-btn" onClick={() => setOpen((v) => !v)} aria-label="فتح القائمة" aria-expanded={open}>☰</button>
        </div>

        <div className="nav-final-desktop-bar nav-tree-mainbar">
          <a href="/" className="nav-final-brand nav-final-brand-icon-only" aria-label="العودة إلى الصفحة الرئيسية">
            <span className="nav-final-logo-link nav-final-logo-badge nav-final-logo-badge-icon-only">
              <img src="/logo-khwarizmia-icon-new.png" alt="أيقونة خوارزمية الإعراب" className="brand-logo contain-logo nav-final-logo" />
            </span>
          </a>
          <nav className="desktop-links nav-final-links nav-tree-links" aria-label="التنقل الرئيسي">
            <a href="/">الرئيسية</a>
            <a href={protectedHref("/dashboard")} aria-disabled={locked}>لوحتي</a>
            <TopicDropdown compact currentCode={currentTopicCode} buttonLabel="الموضوعات" locked={locked} />
            <a href={accountHref} className="login-link nav-auth-link nav-account-chip">{accountLabel}</a>
          </nav>
        </div>

        <nav className={`mobile-menu-clean nav-final-mobile-menu ${open ? "open" : ""}`}>
          <a href="/" onClick={() => setOpen(false)}>الرئيسية</a>
          <a href={protectedHref("/dashboard")} onClick={() => setOpen(false)} aria-disabled={locked}>لوحتي</a>
          <TopicDropdown currentCode={currentTopicCode} buttonLabel="الموضوعات" className="mobile-topic-dropdown" locked={locked} />
          <a href={accountHref} onClick={() => setOpen(false)} className="login-link mobile-login nav-account-chip">{accountLabel}</a>
        </nav>
      </div>
    </header>
  );
}
