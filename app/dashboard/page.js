"use client";

import { useEffect, useMemo, useState } from "react";
import { getMyProgress } from "../../lib/db";
import { getTopicRoutes, getTopicByCode } from "../../lib/topics";
import { supabase } from "../../lib/supabaseClient";
import AuthLockGate from "../components/AuthLockGate";

export default function DashboardPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userName, setUserName] = useState("");

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        setLoading(true);
        setError("");
        const data = await getMyProgress();
        if (!active) return;
        setRows(data || []);
      } catch {
        if (!active) return;
        setError("تعذر تحميل التقدم من Supabase");
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;
    async function loadUser() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!active) return;
        setUserName(user?.user_metadata?.full_name || "");
      } catch {
        if (active) setUserName("");
      }
    }
    loadUser();
    return () => { active = false; };
  }, []);

  const summary = useMemo(() => {
    const totalTopics = rows.length;
    const completedLearn = rows.filter((r) => r.learn_completed).length;
    const completedPractice = rows.filter((r) => r.practice_completed).length;
    const passedQuiz = rows.filter((r) => r.quiz_passed).length;
    const avgLearnPercent = totalTopics > 0 ? Math.round(rows.reduce((acc, r) => acc + (Number(r.percent) || 0), 0) / totalTopics) : 0;
    const avgPracticePercent = totalTopics > 0 ? Math.round(rows.reduce((acc, r) => acc + (Number(r.practice_percent) || 0), 0) / totalTopics) : 0;
    return { totalTopics, completedLearn, completedPractice, passedQuiz, avgLearnPercent, avgPracticePercent };
  }, [rows]);

  return (
    <AuthLockGate title="لوحة التقدم تفتح بعد تسجيل الدخول" text="يجب تسجيل الدخول أولًا حتى تُفتح لوحة التقدم والشهادة وروابط الموضوعات المرتبطة بحساب الطالب.">
      <div className="dashboard-page-modern">
        <section className="card dashboard-hero-modern card-glow">
          <div className="dashboard-hero-copy">
            <div className="section-kicker">لوحة التقدم</div>
            <h1 className="h1">{userName ? `مرحبًا يا ${userName}` : "تابع تقدّمك"}</h1>
            <p className="p">هنا تظهر حالة <strong>المرحلة الأولى</strong> و<strong>المرحلة الثانية</strong> و<strong>المرحلة النهائية</strong> لكل موضوع بشكل واضح ومنظّم.</p>
          </div>
          <div className="dashboard-hero-actions">
            <a href="/topics" className="btn btn-primary">اذهب إلى الموضوعات</a>
            <a href="/auth" className="btn btn-soft">إدارة الحساب</a>
          </div>
        </section>

        <section className="dashboard-summary-grid">
          <StatCard value={summary.totalTopics} label="موضوعات محفوظة" />
          <StatCard value={summary.completedLearn} label="مكتمل المرحلة الأولى" />
          <StatCard value={summary.completedPractice} label="مكتمل المرحلة الثانية" />
          <StatCard value={summary.passedQuiz} label="اختبارات ناجحة" />
          <ProgressStatCard value={summary.avgLearnPercent} label="متوسط المرحلة الأولى" />
          <ProgressStatCard value={summary.avgPracticePercent} label="متوسط المرحلة الثانية" />
        </section>

        <section className="card dashboard-list-card">
          <div className="dashboard-list-head">
            <h2>تفصيل المسارات</h2>
            <span className="pill">{rows.length} سجل</span>
          </div>

          {loading && <div className="dashboard-empty-state">جارٍ تحميل البيانات...</div>}
          {!loading && error && <div className="dashboard-message dashboard-message-error">{error}</div>}
          {!loading && !error && rows.length === 0 && <div className="dashboard-empty-state">لا يوجد تقدم محفوظ بعد. ابدأ من صفحة المرحلة الأولى ثم ارجع إلى هنا.</div>}

          {!loading && !error && rows.length > 0 && (
            <div className="dashboard-topic-grid">
              {rows.map((row) => {
                const learnPercent = Number(row.percent) || 0;
                const practicePercent = Number(row.practice_percent) || 0;
                const quizPercent = row.quiz_total && row.quiz_total > 0 ? Math.round((Number(row.quiz_score || 0) / Number(row.quiz_total)) * 100) : 0;
                const topicCode = row.topic_code || row.topic_id || "موضوع";
                const routes = getTopicRoutes(topicCode);
                const topicMeta = getTopicByCode(topicCode);
                const certificateAllowed = !!row.learn_completed && !!row.practice_completed && quizPercent >= 80;
                const requiredKeys = topicMeta?.coverageKeysOrdered || [];
                const learnCoveredCount = Array.isArray(row.coverage) ? row.coverage.filter((k) => requiredKeys.includes(k)).length : 0;
                const practiceCoveredCount = Array.isArray(row.practice_coverage) ? row.practice_coverage.filter((k) => requiredKeys.includes(k)).length : 0;
                const requiredCount = requiredKeys.length;

                return (
                  <article key={`${topicCode}-${row.level}`} className="dashboard-topic-card">
                    <div className="dashboard-topic-head">
                      <div>
                        <h3>{topicMeta?.name_ar || topicCode}</h3>
                        <p>المستوى {row.level} • آخر تحديث: {formatDate(row.updated_at)}</p>
                      </div>
                      <span className="pill pill-accent">{quizPercent ? `${quizPercent}%` : "—"}</span>
                    </div>

                    <div className="dashboard-bars">
                      <ProgressLine title={`المرحلة الأولى${requiredCount ? ` (${learnCoveredCount}/${requiredCount} فروع)` : ""}`} value={learnPercent} />
                      <ProgressLine title={`المرحلة الثانية${requiredCount ? ` (${practiceCoveredCount}/${requiredCount} فروع)` : ""}`} value={practicePercent} />
                      <ProgressLine title="المرحلة النهائية" value={quizPercent} />
                    </div>

                    <div className="dashboard-chip-row">
                      <StatusPill ok={!!row.learn_completed} text="المرحلة الأولى" />
                      <StatusPill ok={!!row.practice_completed} text="المرحلة الثانية" />
                      <StatusPill ok={!!row.quiz_passed} text="اختبار" />
                    </div>

                    <div className="dashboard-action-row">
                      <a href={routes.paths} className="btn btn-primary">المسارات</a>
                      <a href={routes.learn} className="btn btn-soft">المرحلة الأولى</a>
                      <a href={routes.practice} className={`btn btn-soft ${!row.learn_completed ? "is-disabled-link" : ""}`}>المرحلة الثانية</a>
                      <a href={routes.quiz} className={`btn btn-soft ${!row.practice_completed ? "is-disabled-link" : ""}`}>المرحلة النهائية</a>
                      <a href={certificateAllowed ? `/certificate?topicId=${topicCode}&level=${row.level}` : "#"} className={`btn btn-soft ${!certificateAllowed ? "is-disabled-link" : ""}`}>الشهادة</a>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </AuthLockGate>
  );
}

function StatCard({ value, label }) {
  return <article className="card dashboard-stat-card"><strong>{value}</strong><span>{label}</span></article>;
}

function ProgressStatCard({ value, label }) {
  return (
    <article className="card dashboard-stat-card dashboard-stat-card-wide">
      <strong>{value}%</strong>
      <span>{label}</span>
      <div className="dashboard-progress-track"><div className="dashboard-progress-fill" style={{ width: `${value}%` }} /></div>
    </article>
  );
}

function ProgressLine({ title, value }) {
  return (
    <div className="dashboard-progress-line">
      <div className="dashboard-progress-meta"><span>{title}</span><strong>{value}%</strong></div>
      <div className="dashboard-progress-track"><div className="dashboard-progress-fill" style={{ width: `${value}%` }} /></div>
    </div>
  );
}

function StatusPill({ ok, text }) {
  return <span className={`pill ${ok ? "pill-accent" : "pill-muted"}`}>{ok ? `✓ ${text}` : `— ${text}`}</span>;
}

function formatDate(value) {
  if (!value) return "—";
  try { return new Date(value).toLocaleDateString("ar-JO"); } catch { return "—"; }
}
