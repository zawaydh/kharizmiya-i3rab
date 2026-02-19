"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function Page() {
  const [envOk, setEnvOk] = useState(true);
  const [userEmail, setUserEmail] = useState(null);

  useEffect(() => {
    setEnvOk(!!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    supabase.auth.getUser().then(({ data }) => setUserEmail(data?.user?.email ?? null));
  }, []);

  return (
    <div className="grid" style={{gap:18}}>
      <div className="card">
        <h1 className="h1">خوارزمية الإعراب (مستوى متوسط)</h1>
        <p className="p">قالب جاهز: تسجيل دخول + حفظ تقدم + شهادة (HTML) عند اكتمال المتطلبات.</p>

        {!envOk && (
          <div className="card" style={{marginTop:14, borderColor:"rgba(220,38,38,0.35)"}}>
            <div className="kpi"><strong>تنبيه</strong><span className="pill">Supabase ENV غير مضبوط</span></div>
            <p className="p" style={{marginTop:8}}>
              أضف <code>NEXT_PUBLIC_SUPABASE_URL</code> و <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> على Vercel.
            </p>
          </div>
        )}

        <div style={{display:"flex", gap:10, marginTop:14, flexWrap:"wrap"}}>
          <a className="btn btn-primary" href="/auth">تسجيل/دخول</a>
          <a className="btn" href="/dashboard">لوحتي</a>
          <a className="btn" href="/setup">إعدادات سريعة</a>
        </div>

        <div className="hr" />
        <p className="small">الحالة: {userEmail ? <>مسجل كـ <b>{userEmail}</b></> : "غير مسجل"}</p>
      </div>
    </div>
  );
}
