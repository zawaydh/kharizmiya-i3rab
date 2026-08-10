"use client";

import { usePathname } from "next/navigation";
import { PLATFORM_NAME } from "../../lib/brand";

const HIDDEN_DURING_WORK = ["/learn/", "/train/", "/quiz/", "/texts/", "/paths", "/games/", "/i3rab-in-our-speech", "/certificate"] as const;

export default function RouteAwareFooter() {
  const pathname = usePathname() || "/";
  const hidden = HIDDEN_DURING_WORK.some((prefix) =>
    prefix === "/paths" || prefix === "/i3rab-in-our-speech" || prefix === "/certificate"
      ? pathname === prefix
      : pathname.startsWith(prefix),
  );

  if (hidden) return null;

  return (
    <footer className="footer">
      <strong>جميع الحقوق محفوظة © 2026 {PLATFORM_NAME}</strong>
      <span>فكرة وإعداد وتطوير: فاطمة علي الزوايدة</span>
    </footer>
  );
}
