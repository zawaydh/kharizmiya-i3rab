import { Suspense } from "react";
import CertificateClient from "./CertificateClient";
import AuthLockGate from "../components/AuthLockGate";

export default function CertificatePage() {
  return (
    <AuthLockGate title="الشهادة تفتح بعد تسجيل الدخول" text="سجّل الدخول أولًا، ثم استوفِ شروط الشهادة داخل الموضوع.">
      <Suspense fallback={<div className="card">جارٍ تحميل الشهادة...</div>}><CertificateClient /></Suspense>
    </AuthLockGate>
  );
}
