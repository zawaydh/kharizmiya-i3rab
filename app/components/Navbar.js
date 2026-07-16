"use client";

import { useMemo, useState } from "react";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import TopicDropdown from "./TopicDropdown";
import { useAuthUser } from "./useAuthUser";
import { supabase } from "../../lib/supabaseClient";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthUser();
  const locked = !isLoading && !isAuthenticated;
  const accountHref = !isLoading && isAuthenticated ? "/dashboard" : "/auth";
  const protectedHref = (href) => (locked ? "/auth" : href);

  const currentTopicCode = useMemo(() => {
    const queryTopic = searchParams.get("topic");
    if (queryTopic) return queryTopic;
    const segments = (pathname || "").split("/").filter(Boolean);
    if (segments.length >= 2 && ["learn", "train", "quiz", "texts"].includes(segments[0])) return segments[1];
    return undefined;
  }, [pathname, searchParams]);

  async function logout() {
    await supabase.auth.signOut();
    setOpen(false);
    router.push("/");
  }

  function closeMenu() {
    setOpen(false);
  }

  return (
    <header className="platform-navbar">
      <div className="platform-navbar-inner">
        <a href="/" className="platform-navbar-brand" aria-label="منصة خوارزمية الإعراب">
          <img src="/brand-icon.svg" alt="" />
          <span>منصة خوارزمية الإعراب</span>
        </a>

        <nav className="platform-navbar-links" aria-label="التنقل الرئيسي">
          <a href="/" className={pathname === "/" ? "is-active" : ""}>الرئيسية</a>
          <TopicDropdown compact currentCode={currentTopicCode} buttonLabel="الموضوعات" locked={locked} />
          <TopicDropdown compact currentCode={currentTopicCode} buttonLabel="المسارات" locked={locked} mode="paths" />
          <a href={protectedHref("/dashboard")} className={pathname === "/dashboard" ? "is-active" : ""}>لوحتي</a>
        </nav>

        <div className="platform-navbar-account">
          <a href={accountHref}>{isAuthenticated ? "حسابي" : "دخول"}</a>
          {isAuthenticated ? <button type="button" onClick={logout}>خروج</button> : null}
        </div>

        <button
          type="button"
          className="platform-navbar-menu"
          onClick={() => setOpen((value) => !value)}
          aria-label="فتح قائمة التنقل"
          aria-expanded={open}
        >
          <span />
          <span />
          <span />
        </button>

        <nav className={`platform-navbar-mobile ${open ? "is-open" : ""}`} aria-label="التنقل على الهاتف">
          <a href="/" onClick={closeMenu}>الرئيسية</a>
          <TopicDropdown currentCode={currentTopicCode} buttonLabel="الموضوعات" className="mobile-topic-dropdown" locked={locked} onNavigate={closeMenu} />
          <TopicDropdown currentCode={currentTopicCode} buttonLabel="المسارات" className="mobile-topic-dropdown" locked={locked} mode="paths" onNavigate={closeMenu} />
          <a href={protectedHref("/dashboard")} onClick={closeMenu}>لوحتي</a>
          <a href={accountHref} onClick={closeMenu}>{isAuthenticated ? "حسابي" : "دخول"}</a>
          {isAuthenticated ? <button type="button" onClick={logout}>تسجيل الخروج</button> : null}
        </nav>
      </div>
    </header>
  );
}
