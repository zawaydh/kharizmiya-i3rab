"use client";

import { useEffect, useMemo, useState } from "react";
import { getMyProgress } from "../../lib/db";
import { getTopicRoutes, getTopicByCode, hasVisualPath } from "../../lib/topics";
import { supabase } from "../../lib/supabaseClient";
import AuthLockGate from "../components/AuthLockGate";
import { getQuizPercent, isCertificateEligible } from "../../lib/certificateEligibility";

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
            <p className="p">
              تابع إنجازك في <strong>التعلّم الموجّه</strong> و<strong>التدريب</strong> و<strong>الاختبار النهائي</strong>
              لكل موضوع، واعرف أين توقفت وما الخطوة التالية.
            </p>
          </div>
          <div className="dashboard-hero-actions">
            <a href="/topics" className="btn btn-primary">اذهب إلى الموضوعات</a>
            <a href="/auth" className="btn btn-soft">إدارة الحساب</a>
          </div>
        </section>

        <section className="dashboard-summary-grid">
          <StatCard value={summary.totalTopics} label="موضوعات بدأت بها" />
          <StatCard value={summary.completedLearn} label="أتممت التعلّم الموجّه" />
          <StatCard value={summary.completedPractice} label="أتممت التدريب" />
          <StatCard value={summary.passedQuiz} label="اختبارات نهائية مجتازة" />
          <ProgressStatCard value={summary.avgLearnPercent} label="متوسط تقدّم التعلّم الموجّه" />
          <ProgressStatCard value={summary.avgPracticePercent} label="متوسط تقدّم التدريب" />
        </section>

        <section className="card dashboard-list-card">
          <div className="dashboard-list-head">
            <div>
              <h2>تفاصيل التقدم في الموضوعات</h2>
              <p className="dashboard-list-description">تعرض كل بطاقة تقدمك التفصيلي والخطوات المتاحة داخل الموضوع.</p>
            </div>
            <span className="pill">{rows.length} {rows.length === 1 ? "موضوع" : "موضوعات"}</span>
          </div>

          {loading && <div className="dashboard-empty-state">جارٍ تحميل البيانات...</div>}
          {!loading && error && <div className="dashboard-message dashboard-message-error">{error}</div>}
          {!loading && !error && rows.length === 0 && <div className="dashboard-empty-state">لا يوجد تقدم محفوظ بعد. ابدأ من صفحة التعلّم الموجّه ثم ارجع إلى هنا.</div>}

          {!loading && !error && rows.length > 0 && (
            <div className="dashboard-topic-grid">
              {rows.map((row) => {
                const learnPercent = Number(row.percent) || 0;
                const practicePercent = Number(row.practice_percent) || 0;
                const quizPercent = getQuizPercent(row);
                const topicCode = row.topic_code || row.topic_id || "موضوع";
                const routes = getTopicRoutes(topicCode);
                const topicMeta = getTopicByCode(topicCode);
                const visualPathAvailable = hasVisualPath(topicCode);
                const certificateAllowed = isCertificateEligible(row);
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
                      <span className={`pill ${quizPercent ? "pill-accent" : "pill-muted"}`}>
                        {quizPercent ? `نتيجة الاختبار: ${quizPercent}%` : "لم يبدأ الاختبار"}
                      </span>
                    </div>

                    <div className="dashboard-bars">
                      <ProgressLine title={`التعلّم الموجّه${requiredCount ? ` (${learnCoveredCount}/${requiredCount} فروع)` : ""}`} value={learnPercent} />
                      <ProgressLine title={`التدريب${requiredCount ? ` (${practiceCoveredCount}/${requiredCount} فروع)` : ""}`} value={practicePercent} />
                      <ProgressLine title="الاختبار النهائي" value={quizPercent} />
                    </div>

                    <div className="dashboard-chip-row">
                      <StatusPill ok={!!row.learn_completed} text="التعلّم الموجّه" />
                      <StatusPill ok={!!row.practice_completed} text="التدريب" />
                      <StatusPill ok={!!row.quiz_passed} text="الاختبار النهائي" />
                    </div>

                    {!visualPathAvailable ? (
                      <div className="dashboard-visual-path-notice" role="note">
                        <strong>لا يوجد مسار بصري لهذا الموضوع</strong>
                        <span>المسارات البصرية مخصّصة للجملة الاسمية والجملة الفعلية، ويمكنك إكمال هذا الموضوع عبر مراحله الثلاث.</span>
                      </div>
                    ) : null}

                    <div className="dashboard-action-row">
                      {visualPathAvailable ? <a href={routes.paths} className="btn btn-primary">المسار البصري</a> : null}
                      <a href={routes.learn} className={visualPathAvailable ? "btn btn-soft" : "btn btn-primary"}>التعلّم الموجّه</a>
                      <a
                        href={row.learn_completed ? routes.practice : "#"}
                        title={!row.learn_completed ? "أكمل التعلّم الموجّه أولًا لفتح التدريب" : undefined}
                        aria-disabled={!row.learn_completed}
                        className={`btn btn-soft ${!row.learn_completed ? "is-disabled-link" : ""}`}
                      >التدريب</a>
                      <a
                        href={row.practice_completed ? routes.quiz : "#"}
                        title={!row.practice_completed ? "أكمل التدريب أولًا لفتح الاختبار النهائي" : undefined}
                        aria-disabled={!row.practice_completed}
                        className={`btn btn-soft ${!row.practice_completed ? "is-disabled-link" : ""}`}
                      >الاختبار النهائي</a>
                      <a
                        href={row.quiz_total ? routes.texts : "#"}
                        title={!row.quiz_total ? "ابدأ الاختبار النهائي أولًا لفتح لعبة النصوص" : undefined}
                        aria-disabled={!row.quiz_total}
                        className={`btn btn-soft ${!row.quiz_total ? "is-disabled-link" : ""}`}
                      >لعبة النصوص</a>
                      <a
                        href={certificateAllowed ? `/certificate?topicId=${topicCode}&level=${row.level}` : "#"}
                        title={!certificateAllowed ? "أكمل التعلّم الموجّه والتدريب واجتز الاختبار النهائي لفتح الشهادة" : undefined}
                        aria-disabled={!certificateAllowed}
                        className={`btn btn-soft ${!certificateAllowed ? "is-disabled-link" : ""}`}
                      >الشهادة</a>
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
