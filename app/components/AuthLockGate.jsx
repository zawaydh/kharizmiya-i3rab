"use client";

import { usePathname } from "next/navigation";
import { useAuthUser } from "./useAuthUser";

export default function AuthLockGate({
  title = "تحتاج إلى تسجيل الدخول",
  text = "سجّل الدخول أولًا.",
  nextHref = null,
  children,
}) {
  const { isAuthenticated, isLoading } = useAuthUser();
  const pathname = usePathname();
  const destination = nextHref || pathname || "/topics";
  const loginHref = `/auth?next=${encodeURIComponent(destination)}`;

  if (isLoading) {
    return <div className="card auth-lock-card">جارٍ التحقق من الحساب...</div>;
  }

  if (!isAuthenticated) {
    return (
      <section className="card auth-lock-card card-glow">
        <div className="section-kicker">الوصول مقفل</div>
        <h1 className="h1">{title}</h1>
        <p className="p student-short-lock-text">{text}</p>
        <div className="auth-purpose-note auth-purpose-note-inline" role="note" aria-label="فائدة التسجيل">
          <strong>لماذا أُسجّل؟</strong>
          <p>التسجيل ليس لفتح محتوى مختلف، بل لحفظ تقدمك، وتمييز مرحلتك الحالية: التعلّم الموجّه أو التدريب أو الاختبار النهائي، ثم عرضها لك في لوحة التقدم.</p>
        </div>
        <div className="auth-lock-actions">
          <a href={loginHref} className="btn btn-primary">تسجيل الدخول</a>
          <a href="/" className="btn btn-soft">العودة للرئيسية</a>
        </div>
      </section>
    );
  }

  return children;
}
