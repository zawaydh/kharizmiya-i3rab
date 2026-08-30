"use client";

import Image from "next/image";
import Link from "next/link";
import { PLATFORM_ARIA_LABEL, PLATFORM_NAME } from "../../lib/brand";
import { useEffect, useState, useSyncExternalStore, type SVGProps } from "react";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import TopicDropdown from "./TopicDropdown";
import { useDeferredNavbarAuth } from "./useDeferredNavbarAuth";

type NavIconName = "home" | "key" | "board" | "game" | "login" | "logout" | "collapse" | "expand";
const SIDEBAR_STORAGE_KEY = "kharizmiya-sidebar-collapsed";
const SIDEBAR_CHANGE_EVENT = "kharizmiya-sidebar-change";

function subscribeSidebarPreference(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(SIDEBAR_CHANGE_EVENT, onStoreChange);
  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(SIDEBAR_CHANGE_EVENT, onStoreChange);
  };
}

function getSidebarPreference() {
  return window.localStorage.getItem(SIDEBAR_STORAGE_KEY) === "true";
}

function updateSidebarPreference(collapsed: boolean) {
  window.localStorage.setItem(SIDEBAR_STORAGE_KEY, String(collapsed));
  window.dispatchEvent(new Event(SIDEBAR_CHANGE_EVENT));
}

function NavIcon({ name }: { name: NavIconName }) {
  const common: SVGProps<SVGSVGElement> = {
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
  if (name === "key") {
    return <svg {...common}><circle cx="8" cy="12" r="4"/><path d="M12 12h9M18 12v3M15 12v2"/></svg>;
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
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const searchKey = searchParams.toString();
  const routeKey = `${pathname || ""}?${searchKey}`;
  const collapsed = useSyncExternalStore(
    subscribeSidebarPreference,
    getSidebarPreference,
    () => false,
  );
  const [mobileMenu, setMobileMenu] = useState({ open: false, routeKey });
  const mobileOpen = mobileMenu.open && mobileMenu.routeKey === routeKey;
  const { isAuthenticated, isLoading } = useDeferredNavbarAuth();
  const locked = !isLoading && !isAuthenticated;
  const protectedHref = (href: string): string => (locked ? "/auth" : href);

  const queryTopic = searchParams.get("topic");
  const pathSegments = (pathname || "").split("/").filter(Boolean);
  const firstPathSegment = pathSegments[0];
  const currentTopicCode = queryTopic || (
    pathSegments.length >= 2 && firstPathSegment && ["learn", "train", "quiz", "texts", "guide"].includes(firstPathSegment)
      ? pathSegments[1]
      : undefined
  );

  const topicSectionActive = ["/topics", "/learn", "/train", "/quiz", "/texts"].some(
    (prefix) => pathname === prefix || pathname?.startsWith(`${prefix}/`),
  );
  const guideActive = pathname === "/guide" || pathname?.startsWith("/guide/");
  const keysActive = pathname === "/i3rab-keys";
  const pathsActive = pathname === "/paths";
  const certificateRoute = pathname === "/certificate";
  const gamesActive = pathname === "/games" || pathname?.startsWith("/games/") || pathname === "/i3rab-in-our-speech";

  useEffect(() => {
    document.body.classList.toggle("certificate-route", certificateRoute);
    return () => document.body.classList.remove("certificate-route");
  }, [certificateRoute]);

  useEffect(() => {
    document.body.classList.toggle("nav-collapsed", collapsed);
    return () => document.body.classList.remove("nav-collapsed");
  }, [collapsed]);

  useEffect(() => {
    document.body.classList.toggle("nav-mobile-open", mobileOpen);
    return () => document.body.classList.remove("nav-mobile-open");
  }, [mobileOpen]);

  useEffect(() => {
    function closeEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setMobileMenu({ open: false, routeKey });
    }
    document.addEventListener("keydown", closeEscape);
    return () => document.removeEventListener("keydown", closeEscape);
  }, [routeKey]);

  function toggleCollapsed() {
    updateSidebarPreference(!collapsed);
  }

  function ensureExpanded() {
    if (collapsed) updateSidebarPreference(false);
  }

  function closeMobile() {
    setMobileMenu({ open: false, routeKey });
  }

  async function logout() {
    const { supabase } = await import("../../lib/supabaseClient");
    await supabase.auth.signOut();
    closeMobile();
    router.push("/");
  }

  if (certificateRoute) return null;

  return (
    <div className="app-navigation-root">
      <div className="app-mobile-bar">
        <Link href="/" className="app-mobile-brand" aria-label={PLATFORM_ARIA_LABEL}>
          <Image src="/brand-icon.svg" alt="" width={34} height={34} priority />
          <span>{PLATFORM_NAME}</span>
        </Link>
        <button
          type="button"
          className="app-mobile-menu-button"
          onClick={() => setMobileMenu({ open: true, routeKey })}
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
          <Link href="/" className="app-sidebar-brand" aria-label={PLATFORM_ARIA_LABEL} onClick={closeMobile}>
            <Image src="/brand-icon.svg" alt="" width={40} height={40} priority />
            <span className="app-nav-label">{PLATFORM_NAME}</span>
          </Link>

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
          <Link href="/" className={`app-nav-item ${pathname === "/" ? "is-active" : ""}`} onClick={closeMobile} title="الرئيسية">
            <span className="app-nav-icon"><NavIcon name="home" /></span>
            <span className="app-nav-label">الرئيسية</span>
          </Link>

          <div className="app-nav-topic-wrap" onClickCapture={ensureExpanded}>
            <TopicDropdown
              currentCode={currentTopicCode}
              buttonLabel="تعليمات قبل التدريب"
              className={guideActive ? "is-active" : ""}
              locked={false}
              mode="guide"
              onNavigate={closeMobile}
              icon="guide"
            />
          </div>

          <Link href="/i3rab-keys" className={`app-nav-item ${keysActive ? "is-active" : ""}`} onClick={closeMobile} title="مفاتيح الإعراب">
            <span className="app-nav-icon"><NavIcon name="key" /></span>
            <span className="app-nav-label">مفاتيح الإعراب</span>
          </Link>

          <div className="app-nav-topic-wrap" onClickCapture={ensureExpanded}>
            <TopicDropdown
              currentCode={currentTopicCode}
              buttonLabel="مدرّب التفكير"
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
              locked={false}
              mode="paths"
              onNavigate={closeMobile}
              icon="paths"
            />
          </div>

          <a href={protectedHref("/dashboard")} className={`app-nav-item ${pathname === "/dashboard" ? "is-active" : ""}`} onClick={closeMobile} title="لوحتي">
            <span className="app-nav-icon"><NavIcon name="board" /></span>
            <span className="app-nav-label">لوحتي</span>
          </a>

          <a href="/games" className={`app-nav-item ${gamesActive ? "is-active" : ""}`} onClick={closeMobile} title="الألعاب">
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
