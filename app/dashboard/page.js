"use client";

import { useEffect, useMemo, useState } from "react";
import { TOPICS, loadProgress, saveProgress } from "@/lib/db";
import { supabase } from "@/lib/supabaseClient";

export default function Dashboard() {
  const [userEmail, setUserEmail] = useState(null);
  const [rows, setRows] = useState([]);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserEmail(data?.user?.email ?? null));
  }, []);

  async function refresh() {
    const data = await loadProgress();
    setRows(data);
  }

  useEffect(() => { if (userEmail) refresh(); }, [userEmail]);

  const progressMap = useMemo(() => {
    const m = new Map();
    for (const r of rows) m.set(r.topic_code, r);
    return m;
  }, [rows]);

  const overall = useMemo(() => {
    if (!TOPICS.length) return 0;
    const sum = TOPICS.reduce((acc, t) => acc + (progressMap.get(t.topic_code)?.percent ?? 0), 0);
    return Math.round(sum / TOPICS.length);
  }, [progressMap]);

  const canCertificate = overall >= 100;

  async function setPercent(topic_code, percent) {
    setMsg(null);
    try {
      await saveProgress({ topic_code, level: "متوسط", percent });
      await refresh();
      setMsg("تم الحفظ.");
    } catch (e) {
      setMsg("خطأ: " + (e?.message || String(e)));
    }
  }

  function downloadCertificate() {
    const now = new Date();
    const html = `<!doctype html><html lang="ar" dir="rtl"><meta charset="utf-8"><title>شهادة</title>
<body style="font-family:Arial,'Noto Sans Arabic';background:#f6f7fb;margin:0">
<div style="max-width:900px;margin:40px auto;background:#fff;border:2px solid #0b1220;padding:28px;border-radius:16px">
<h1 style="margin:0">شهادة اجتياز المستوى المتوسط</h1>
<p style="margin:10px 0 0;line-height:1.8;color:#333">تشهد منصة <b>خوارزمية الإعراب</b> أن الطالب/ـة أتم المتطلبات.</p>
<div style="margin-top:18px;border:1px dashed #555;padding:18px;border-radius:12px">
<div><b>البريد:</b> ${userEmail ?? "-"}</div>
<div style="margin-top:8px"><b>التاريخ:</b> ${now.toLocaleDateString("ar-JO")}</div>
<div style="margin-top:8px"><b>الإكمال:</b> ${overall}%</div>
</div>
<p style="margin-top:18px;color:#555;font-size:12px">شهادة رقمية أولية (MVP)</p>
</div></body></html>`;
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "certificate-kharizmiya-i3rab.html";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  if (!userEmail) {
    return (
      <div className="card">
        <h1 className="h1">لوحة التقدم</h1>
        <p className="p">سجّل دخول أولاً.</p>
        <div style={{marginTop:12}}><a className="btn btn-primary" href="/auth">تسجيل الدخول</a></div>
      </div>
    );
  }

  return (
    <div className="grid" style={{gap:16}}>
      <div className="card">
        <div className="kpi"><strong>لوحة التقدم</strong><span className="pill">{userEmail}</span></div>
        <p className="p" style={{marginTop:8}}>MVP لحفظ التقدم. لاحقاً سنربطه بالتدريب الفعلي.</p>

        <div className="hr" />

        <div className="kpi">
          <strong>الإكمال العام</strong>
          <span className="pill">{overall}%</span>
        </div>

        <div style={{marginTop:12, display:"flex", gap:10, flexWrap:"wrap"}}>
          <button className={"btn " + (canCertificate ? "btn-primary" : "")} disabled={!canCertificate} onClick={downloadCertificate}>
            تحميل الشهادة
          </button>
          {!canCertificate && <span className="small">الشهادة تتفعل عند 100% (مؤقتاً)</span>}
        </div>

        {msg && <div className="card" style={{marginTop:14}}><p className="p">{msg}</p></div>}
      </div>

      <div className="card">
        <h2 style={{margin:"0 0 10px"}}>موضوعات المستوى</h2>
        <div className="grid" style={{gap:12}}>
          {TOPICS.map((t) => {
            const p = progressMap.get(t.topic_code)?.percent ?? 0;
            return (
              <div className="card" key={t.topic_code}>
                <div className="topic">
                  <div>
                    <h3>{t.name_ar}</h3>
                    <p>{t.desc}</p>
                  </div>
                  <span className="pill">{p}%</span>
                </div>
                <div style={{display:"flex", gap:10, marginTop:12, flexWrap:"wrap"}}>
                  <button className="btn" onClick={() => setPercent(t.topic_code, Math.min(100, p + 10))}>+10%</button>
                  <button className="btn" onClick={() => setPercent(t.topic_code, Math.max(0, p - 10))}>-10%</button>
                  <button className="btn btn-primary" onClick={() => setPercent(t.topic_code, 100)}>إكمال</button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
