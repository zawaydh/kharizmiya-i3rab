"use client";

import AuthLockGate from "../../components/AuthLockGate";

export default function Page() {
  return (
    <AuthLockGate title="سجّل الدخول لتكمل التعلّم" text="صفحة البداية فقط مفتوحة للجميع، أما صفحات التعلّم الرسمية فتحتاج إلى حساب لحفظ التقدم.">
      <section className="card card-glow" style={{ textAlign: "center" }}>
        <div className="section-kicker">صفحة قديمة</div>
        <h1 className="h1">انتقل إلى النسخة الرسمية</h1>
        <p className="p">تم توحيد التعلّم في صفحة الموضوعات حتى لا يتشتت الطالب بين أكثر من نظام.</p>
        <a className="btn btn-primary" href="/learn/nominal-advanced">افتح تعلّم المبتدأ</a>
      </section>
    </AuthLockGate>
  );
}
