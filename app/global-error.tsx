"use client";

import { useEffect } from "react";
import { reportClientError } from "../lib/clientErrorReporting";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    void reportClientError({
      source: "global-boundary",
      message: error.message,
      digest: error.digest,
    });
  }, [error]);

  return (
    <html lang="ar" dir="rtl">
      <body className="platform-body">
        <main className="container platform-main">
          <section className="card auth-lock-card" role="alert">
            <h1 className="h1">تعذر تشغيل المنصة</h1>
            <p className="p">أُرسل تقرير تقني مختصر للمراقبة. حاول إعادة تشغيل الصفحة.</p>
            <button type="button" className="btn btn-primary" onClick={reset}>إعادة المحاولة</button>
          </section>
        </main>
      </body>
    </html>
  );
}
