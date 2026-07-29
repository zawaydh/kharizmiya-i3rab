"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import TopicDropdown from "./TopicDropdown";
import { useAuthUser } from "./useAuthUser";
import { supabase } from "../../lib/supabaseClient";

function NavIcon({ name }) {
  const common = {
    width: 20,
    height: 20,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  };

  if (name === "home") {
    return <svg {...common}><path d="m3 11 9-8 9 8"/><path d="M5 10v10h14V10"/><path d="M9 20v-6h6v6"/></svg>;
  }
  if (name === "board") {
    return <svg {...common}><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 7h8M8 11h8M8 15h5"/></svg>;
  }
  if (name === "game") {
    return <svg {...common}><path d="M8 9h8a5 5 0 0 1 4.8 6.4l-.7 2.3a2.4 2.4 0 0 1-4.1 1l-1.2-1.4H9.2L8 18.7a2.4 2.4 0 0 1-4.1-1l-.7-2.3A5 5 0 0 1 8 9Z"/><path d="M8 13v4M6 15h4M16.5 13.5h.01M18.5 15.5h.01"/></svg>;
  }
  if (name === "login") {
    return <svg {...common}><path d="M10 17l5-5-5-5"/><path d="M15 12H3"/><path d="M14 4h5a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-5"/></svg>;
  }
  if (name === "logout") {
    return <svg {...common}><path d="M14 17l-5-5 5-5"/><path d="M9 12h12"/><path d="M10 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h5"/></svg>;
  }
  if (name === "collapse") {
    return <svg {...common}><path d="m15 18-6-6 6-6"/></svg>;
  }
  if (name === "expand") {
    return <svg {...common}><path d="m9 18 6-6-6-6"/></svg>;
  }
  return null;
}

export default function Navbar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const searchKey = searchParams.toString();
  const { isAuthenticated, isLoading } = useAuthUser();
  const locked = !isLoading && !isAuthenticated;
  const protectedHref = (href) => (locked ? "/auth" : href);

  const queryTopic = searchParams.get("topic");
  const pathSegments = (pathname || "").split("/").filter(Boolean);
  const currentTopicCode = queryTopic || (
    pathSegments.length >= 2 && ["learn", "train", "quiz", "texts"].includes(pathSegments[0])
      ? pathSegments[1]
      : undefined
  );

  const topicSectionActive = ["/topics", "/learn", "/train", "/quiz", "/texts"].some(
    (prefix) => pathname === prefix || pathname?.startsWith(`${prefix}/`),
  );
  const pathsActive = pathname === "/paths";

  useEffect(() => {
    const stored = window.localStorage.getItem("kharizmiya-sidebar-collapsed");
    if (stored === "true") setCollapsed(true);
  }, []);

  useEffect(() => {
    document.body.classList.toggle("nav-collapsed", collapsed);
    window.localStorage.setItem("kharizmiya-sidebar-collapsed", String(collapsed));
    return () => document.body.classList.remove("nav-collapsed");
  }, [collapsed]);

  useEffect(() => {
    document.body.classList.toggle("nav-mobile-open", mobileOpen);
    return () => document.body.classList.remove("nav-mobile-open");
  }, [mobileOpen]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname, searchKey]);

  useEffect(() => {
    function closeEscape(event) {
      if (event.key === "Escape") setMobileOpen(false);
    }
    document.addEventListener("keydown", closeEscape);
    return () => document.removeEventListener("keydown", closeEscape);
  }, []);

  function toggleCollapsed() {
    setCollapsed((value) => !value);
  }

  function ensureExpanded() {
    if (collapsed) setCollapsed(false);
  }

  function closeMobile() {
    setMobileOpen(false);
  }

  async function logout() {
    await supabase.auth.signOut();
    closeMobile();
    router.push("/");
  }

  return (
    <div className="app-navigation-root">
      <div className="app-mobile-bar">
        <a href="/" className="app-mobile-brand" aria-label="منصة خوارزمية الإعراب">
          <Image src="/brand-icon.svg" alt="" width={34} height={34} priority />
          <span>خوارزمية الإعراب</span>
        </a>
        <button
          type="button"
          className="app-mobile-menu-button"
          onClick={() => setMobileOpen(true)}
          aria-label="فتح القائمة"
          aria-expanded={mobileOpen}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      <button
        type="button"
        className={`app-nav-backdrop ${mobileOpen ? "is-open" : ""}`}
        onClick={closeMobile}
        aria-label="إغلاق القائمة"
        tabIndex={mobileOpen ? 0 : -1}
      />

      <aside className={`app-sidebar ${collapsed ? "is-collapsed" : ""} ${mobileOpen ? "is-mobile-open" : ""}`} aria-label="التنقل الرئيسي">
        <div className="app-sidebar-header">
          <a href="/" className="app-sidebar-brand" aria-label="منصة خوارزمية الإعراب" onClick={closeMobile}>
            <Image src="/brand-icon.svg" alt="" width={40} height={40} priority />
            <span className="app-nav-label">منصة خوارزمية الإعراب</span>
          </a>

          <button
            type="button"
            className="app-sidebar-collapse"
            onClick={toggleCollapsed}
            aria-label={collapsed ? "توسيع القائمة" : "طي القائمة"}
            title={collapsed ? "توسيع القائمة" : "طي القائمة"}
          >
            <NavIcon name={collapsed ? "expand" : "collapse"} />
          </button>

          <button type="button" className="app-sidebar-mobile-close" onClick={closeMobile} aria-label="إغلاق القائمة">×</button>
        </div>

        <nav className="app-sidebar-nav">
          <a href="/" className={`app-nav-item ${pathname === "/" ? "is-active" : ""}`} onClick={closeMobile} title="الرئيسية">
            <span className="app-nav-icon"><NavIcon name="home" /></span>
            <span className="app-nav-label">الرئيسية</span>
          </a>

          <div className="app-nav-topic-wrap" onClickCapture={ensureExpanded}>
            <TopicDropdown
              currentCode={currentTopicCode}
              buttonLabel="الموضوعات"
              className={topicSectionActive ? "is-active" : ""}
              locked={locked}
              onNavigate={closeMobile}
              icon="topics"
            />
          </div>

          <div className="app-nav-topic-wrap" onClickCapture={ensureExpanded}>
            <TopicDropdown
              currentCode={currentTopicCode}
              buttonLabel="المسارات البصرية"
              className={pathsActive ? "is-active" : ""}
              locked={locked}
              mode="paths"
              onNavigate={closeMobile}
              icon="paths"
            />
          </div>

          <a href={protectedHref("/dashboard")} className={`app-nav-item ${pathname === "/dashboard" ? "is-active" : ""}`} onClick={closeMobile} title="لوحتي">
            <span className="app-nav-icon"><NavIcon name="board" /></span>
            <span className="app-nav-label">لوحتي</span>
          </a>

          <a href="/i3rab-in-our-speech" className={`app-nav-item ${pathname === "/i3rab-in-our-speech" ? "is-active" : ""}`} onClick={closeMobile} title="الألعاب">
            <span className="app-nav-icon"><NavIcon name="game" /></span>
            <span className="app-nav-label">الألعاب</span>
          </a>
        </nav>

        <div className="app-sidebar-account">
          {isAuthenticated ? (
            <button type="button" className="app-nav-item app-account-action" onClick={logout} title="تسجيل الخروج">
              <span className="app-nav-icon"><NavIcon name="logout" /></span>
              <span className="app-nav-label">تسجيل الخروج</span>
            </button>
          ) : (
            <a href="/auth" className={`app-nav-item app-account-action ${pathname === "/auth" ? "is-active" : ""}`} onClick={closeMobile} title="تسجيل الدخول">
              <span className="app-nav-icon"><NavIcon name="login" /></span>
              <span className="app-nav-label">تسجيل الدخول</span>
            </a>
          )}
        </div>
      </aside>
    </div>
  );
}
