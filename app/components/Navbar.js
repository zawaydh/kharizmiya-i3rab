"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import TopicDropdown from "./TopicDropdown";
import { useAuthUser } from "./useAuthUser";
import { supabase } from "../../lib/supabaseClient";
import Image from "next/image";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const headerRef = useRef(null);
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


  useEffect(() => {
    setOpen(false);
  }, [pathname, searchKey]);

  useEffect(() => {
    function closeOutside(event) {
      if (open && headerRef.current && !headerRef.current.contains(event.target)) setOpen(false);
    }
    function closeEscape(event) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", closeOutside);
    document.addEventListener("keydown", closeEscape);
    return () => {
      document.removeEventListener("mousedown", closeOutside);
      document.removeEventListener("keydown", closeEscape);
    };
  }, [open]);

  async function logout() {
    await supabase.auth.signOut();
    setOpen(false);
    router.push("/");
  }

  function closeMenu() {
    setOpen(false);
  }

  return (
    <header ref={headerRef} className="platform-navbar">
      <div className="platform-navbar-inner">
        <a href="/" className="platform-navbar-brand" aria-label="منصة خوارزمية الإعراب">
          <Image src="/brand-icon.svg" alt="" width={42} height={42} priority />
          <span>منصة خوارزمية الإعراب</span>
        </a>

        <nav className="platform-navbar-links" aria-label="التنقل الرئيسي">
          <a href="/" className={pathname === "/" ? "is-active" : ""}>الرئيسية</a>
          <TopicDropdown compact currentCode={currentTopicCode} buttonLabel="الموضوعات" locked={locked} />
          <TopicDropdown compact currentCode={currentTopicCode} buttonLabel="المسارات البصرية" locked={locked} mode="paths" />
          <a href={protectedHref("/dashboard")} className={pathname === "/dashboard" ? "is-active" : ""}>لوحتي</a>
        </nav>

        <div className="platform-navbar-account">
          {isAuthenticated ? (
            <button type="button" onClick={logout}>تسجيل الخروج</button>
          ) : (
            <a href="/auth">تسجيل الدخول</a>
          )}
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

        <button
          type="button"
          className={`platform-navbar-backdrop ${open ? "is-open" : ""}`}
          aria-label="إغلاق قائمة التنقل"
          tabIndex={open ? 0 : -1}
          onClick={closeMenu}
        />

        <nav className={`platform-navbar-mobile ${open ? "is-open" : ""}`} aria-label="التنقل على الهاتف">
          <div className="platform-navbar-mobile-head">
            <strong>القائمة</strong>
            <button type="button" className="platform-navbar-mobile-close" onClick={closeMenu} aria-label="إغلاق القائمة">×</button>
          </div>
          <a href="/" onClick={closeMenu}>الرئيسية</a>
          <TopicDropdown currentCode={currentTopicCode} buttonLabel="الموضوعات" className="mobile-topic-dropdown" locked={locked} onNavigate={closeMenu} />
          <TopicDropdown currentCode={currentTopicCode} buttonLabel="المسارات البصرية" className="mobile-topic-dropdown" locked={locked} mode="paths" onNavigate={closeMenu} />
          <a href={protectedHref("/dashboard")} onClick={closeMenu}>لوحتي</a>
          {isAuthenticated ? (
            <button type="button" onClick={logout}>تسجيل الخروج</button>
          ) : (
            <a href="/auth" onClick={closeMenu}>تسجيل الدخول</a>
          )}
        </nav>
      </div>
    </header>
  );
}
