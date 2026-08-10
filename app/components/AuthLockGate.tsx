"use client";

import { Suspense, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useAuthUser } from "./useAuthUser";

type Props = {
  title?: string;
  text?: string;
  nextHref?: string | null;
  children: ReactNode;
};

function AuthLockGateContent({
  title = "تحتاج إلى تسجيل الدخول",
  text = "سجّل الدخول أولًا.",
  nextHref = null,
  children,
}: Props) {
  const { isAuthenticated, isLoading } = useAuthUser();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchKey = searchParams.toString();
  const currentHref = `${pathname || "/topics"}${searchKey ? `?${searchKey}` : ""}`;
  const destination = nextHref || currentHref;
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
        <div
          className="auth-purpose-note auth-purpose-note-inline"
          role="note"
          aria-label="فائدة التسجيل"
        >
          <strong>لماذا أُسجّل؟</strong>
          <p>التسجيل مطلوب للدخول إلى المراحل التفاعلية وحفظ تقدمك، وتمييز مرحلتك الحالية: التعلّم الموجّه أو التدريب أو الاختبار النهائي، ثم عرض إنجازك في لوحة التقدم.</p>
        </div>
        <div className="auth-lock-actions">
          <a href={loginHref} className="btn btn-primary">تسجيل الدخول</a>
          <Link href="/" className="btn btn-soft">العودة للرئيسية</Link>
        </div>
      </section>
    );
  }

  return <>{children}</>;
}

export default function AuthLockGate(props: Props) {
  return (
    <Suspense fallback={<div className="card auth-lock-card">جارٍ التحقق من الحساب...</div>}>
      <AuthLockGateContent {...props} />
    </Suspense>
  );
}
