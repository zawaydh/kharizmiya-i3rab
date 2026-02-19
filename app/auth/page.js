"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function AuthPage() {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [msg, setMsg] = useState(null);
  const [userEmail, setUserEmail] = useState(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserEmail(data?.user?.email ?? null));
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setMsg(null);
    try {
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        throw new Error("SUPABASE_ENV_MISSING");
      }
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName || null } },
        });
        if (error) throw error;
        setMsg("تم إنشاء الحساب. إذا كان تأكيد البريد مفعّل: افحص بريدك ثم سجّل دخول.");
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        setUserEmail(data?.user?.email ?? null);
        setMsg("تم تسجيل الدخول.");
      }
    } catch (err) {
      const m = err?.message || String(err);
      setMsg(m === "SUPABASE_ENV_MISSING"
        ? "المتغيرات غير مضبوطة على Vercel: NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY"
        : ("خطأ: " + m)
      );
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setUserEmail(null);
    setMsg("تم تسجيل الخروج.");
  }

  return (
    <div className="card">
      <h1 className="h1">تسجيل الدخول</h1>
      <p className="p">Email + Password عبر Supabase Auth.</p>

      <div className="hr" />

      {userEmail ? (
        <>
          <div className="kpi"><strong>أنت مسجل الآن</strong><span className="pill">{userEmail}</span></div>
          <div style={{display:"flex", gap:10, marginTop:12, flexWrap:"wrap"}}>
            <a className="btn btn-primary" href="/dashboard">لوحة التقدم</a>
            <button className="btn btn-danger" onClick={handleLogout}>خروج</button>
          </div>
        </>
      ) : (
        <>
          <div style={{display:"flex", gap:10, flexWrap:"wrap"}}>
            <button className={"btn " + (mode==="login" ? "btn-primary": "")} onClick={() => setMode("login")}>دخول</button>
            <button className={"btn " + (mode==="signup" ? "btn-primary": "")} onClick={() => setMode("signup")}>إنشاء حساب</button>
          </div>

          <form onSubmit={handleSubmit} style={{marginTop:14}}>
            {mode === "signup" && (
              <div style={{marginBottom:12}}>
                <label>الاسم (اختياري)</label>
                <input className="input" value={fullName} onChange={(e)=>setFullName(e.target.value)} />
              </div>
            )}

            <div style={{marginBottom:12}}>
              <label>البريد</label>
              <input className="input" type="email" required value={email} onChange={(e)=>setEmail(e.target.value)} />
            </div>

            <div style={{marginBottom:12}}>
              <label>كلمة المرور</label>
              <input className="input" type="password" required value={password} onChange={(e)=>setPassword(e.target.value)} />
            </div>

            <button className="btn btn-primary" style={{width:"100%"}} type="submit">
              {mode === "signup" ? "إنشاء" : "دخول"}
            </button>
          </form>
        </>
      )}

      {msg && <div className="card" style={{marginTop:14}}><p className="p">{msg}</p></div>}
    </div>
  );
}
