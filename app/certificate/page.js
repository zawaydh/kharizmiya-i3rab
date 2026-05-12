import { Suspense } from "react";
import CertificateClient from "./CertificateClient";
import AuthLockGate from "../components/AuthLockGate";

export default function Page() {
  return (
    <AuthLockGate title="سجّل الدخول لعرض الشهادة" text="الشهادة مرتبطة بحساب الطالب ونتيجة الاختبار.">
      <Suspense fallback={null}>
        <CertificateClient />
      </Suspense>
    </AuthLockGate>
  );
}
