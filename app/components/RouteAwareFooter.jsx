"use client";

import { usePathname } from "next/navigation";

const HIDDEN_DURING_WORK = ["/learn/", "/train/", "/quiz/", "/texts/", "/paths", "/i3rab-in-our-speech"];

export default function RouteAwareFooter() {
  const pathname = usePathname() || "/";
  const hidden = HIDDEN_DURING_WORK.some((prefix) =>
    prefix === "/paths" ? pathname === "/paths" : prefix === "/i3rab-in-our-speech" ? pathname === prefix : pathname.startsWith(prefix)
  );

  if (hidden) return null;

  return (
    <footer className="footer">
      <strong>جميع الحقوق محفوظة © 2026 منصة خوارزمية الإعراب</strong>
      <span>فكرة وإعداد وتطوير: فاطمة علي الزوايدة</span>
    </footer>
  );
}
