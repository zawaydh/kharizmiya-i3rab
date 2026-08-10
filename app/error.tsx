"use client";

import { useEffect } from "react";
import Link from "next/link";
import { reportClientError } from "../lib/clientErrorReporting";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    void reportClientError({
      source: "route-boundary",
      message: error.message,
      digest: error.digest,
    });
  }, [error]);

  return (
    <section className="card auth-lock-card" role="alert">
      <div className="section-kicker">تعذر إكمال الصفحة</div>
      <h1 className="h1">حدث خطأ غير متوقع</h1>
      <p className="p">أُرسل تقرير تقني مختصر للمراقبة. يمكنك المحاولة مجددًا أو العودة إلى الرئيسية.</p>
      <div className="auth-lock-actions">
        <button type="button" className="btn btn-primary" onClick={reset}>حاول مجددًا</button>
        <Link href="/" className="btn btn-soft">العودة إلى الرئيسية</Link>
      </div>
    </section>
  );
}
