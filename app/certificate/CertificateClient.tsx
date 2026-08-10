"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { useSearchParams } from "next/navigation";
import { getTopicProgress } from "../../lib/db";
import { supabase } from "../../lib/supabaseClient";
import { getTopicMeta } from "../../lib/topicCatalog";
import { getQuizPercent, isCertificateEligible } from "../../lib/certificateEligibility";
import { PLATFORM_NAME } from "../../lib/brand";

function formatCertificateDate(value?: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("ar-JO");
}

type CertificateViewData = { studentName: string; topicName: string; level: string; scorePercent: number; date: string };

export default function CertificateClient() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);
  const [requestError, setRequestError] = useState("");
  const [data, setData] = useState<CertificateViewData>({
    studentName: "الطالب",
    topicName: "",
    level: "المستوى الثاني",
    scorePercent: 0,
    date: "—",
  });

  useEffect(() => {
    async function load() {
      const topicId = searchParams.get("topicId");
      const levelValue = Number(searchParams.get("level") || 2);
      const levelParam = Number.isFinite(levelValue) && levelValue > 0 ? levelValue : 2;

      if (!topicId) {
        setRequestError("تعذر تحديد موضوع الشهادة. افتح الشهادة من لوحة التقدم الخاصة بالموضوع.");
        setAllowed(false);
        setLoading(false);
        return;
      }

      const topicMeta = getTopicMeta(topicId);
      if (!topicMeta) {
        setRequestError("موضوع الشهادة غير موجود في المنصة.");
        setAllowed(false);
        setLoading(false);
        return;
      }

      try {
        const row = await getTopicProgress(topicId, levelParam);
        const {
          data: { user },
        } = await supabase.auth.getUser();

        const percent = getQuizPercent(row);
        const ok = isCertificateEligible(row);
        setAllowed(ok);

        setData({
          studentName: user?.user_metadata?.full_name || "الطالب",
          topicName: topicMeta.name_ar,
          level: levelParam === 1 ? "المستوى الأول" : "المستوى الثاني",
          scorePercent: percent,
          date: formatCertificateDate(row?.certificate_earned_at || row?.updated_at),
        });
      } catch (error) {
        console.error("certificate load failed", error);
        setRequestError("تعذر تحميل بيانات الشهادة الآن.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [searchParams]);

  if (loading) {
    return (
      <div className="certificate-print-page" style={centerWrap}>
        <div style={loadingCard}>جارٍ تحميل الشهادة...</div>
      </div>
    );
  }

  if (requestError) {
    return (
      <div className="certificate-print-page" style={centerWrap}>
        <div style={blockedCard}>
          <div style={blockedIcon}>⚠</div>
          <h2 style={blockedTitle}>تعذر فتح الشهادة</h2>
          <p style={blockedText}>{requestError}</p>
          <a href="/dashboard" style={backBtn} className="print-hide">العودة إلى لوحة التقدم</a>
        </div>
      </div>
    );
  }

  if (!allowed) {
    return (
      <div className="certificate-print-page" style={centerWrap}>
        <div style={blockedCard}>
          <div style={blockedIcon}>🔒</div>
          <h2 style={blockedTitle}>لم تحقق شروط الشهادة بعد</h2>
          <p style={blockedText}>أكمل المراحل السابقة ثم عُد إلى الشهادة.</p>
          <a href="/dashboard" style={backBtn} className="print-hide">العودة إلى لوحة التقدم</a>
        </div>
      </div>
    );
  }

  return (
    <div className="certificate-print-page" style={pageWrap}>
      <div className="certificate-print-card" style={certificateCard}>
        <div style={topGlow} />
        <div style={bottomGlow} />

        <div style={certHeader}>
          <div style={certBadge}>شهادة إتمام</div>
          <h1 style={certTitle}>{PLATFORM_NAME}</h1>
          <div style={certSub}>Certificate of Completion</div>
        </div>

        <div style={divider} />

        <div style={certBody}>
          <p style={lead}>تشهد منصة «{PLATFORM_NAME}» بأن</p>
          <h2 style={studentNameStyle}>{data.studentName}</h2>
          <p style={lead}>قد أتم بنجاح مسار</p>
          <h3 style={topicTitle}>{data.topicName} — {data.level}</h3>

          <div style={scoreBox}>
            <div style={scoreLabel}>نسبة النجاح</div>
            <div style={scoreValue}>{data.scorePercent}%</div>
          </div>

          <div style={metaRow}>
            <div style={metaBox}>
              <div style={metaLabel}>تاريخ الاستحقاق</div>
              <div style={metaValue}>{data.date}</div>
            </div>
            <div style={metaBox}>
              <div style={metaLabel}>الحالة</div>
              <div style={metaValue}>ناجح</div>
            </div>
          </div>
        </div>

        <div style={divider} />

        <div style={certFooter}>
          <div style={signBox}>
            <div style={signLine} />
            <div style={signText}>اعتماد المنصة</div>
          </div>
          <button type="button" onClick={() => window.print()} style={printBtn} className="print-hide">
            طباعة / حفظ PDF
          </button>
        </div>
      </div>
    </div>
  );
}

const pageWrap: CSSProperties = {
  minHeight: "100vh",
  padding: "24px 16px",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  background:
    "radial-gradient(circle at top right, rgba(34,197,94,.12), transparent 30%), radial-gradient(circle at bottom left, rgba(56,189,248,.12), transparent 30%), #f8fafc",
};

const centerWrap: CSSProperties = {
  minHeight: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: 16,
  background: "#f8fafc",
};

const loadingCard: CSSProperties = {
  padding: 24,
  borderRadius: 18,
  background: "#ffffff",
  boxShadow: "0 20px 50px rgba(0,0,0,.08)",
  fontWeight: 800,
};

const blockedCard: CSSProperties = {
  maxWidth: 520,
  width: "100%",
  padding: 28,
  borderRadius: 24,
  background: "#ffffff",
  textAlign: "center",
  boxShadow: "0 20px 50px rgba(0,0,0,.08)",
};

const blockedIcon: CSSProperties = {
  fontSize: 34,
  marginBottom: 10,
};

const blockedTitle: CSSProperties = {
  margin: "0 0 10px",
  color: "#0f172a",
};

const blockedText: CSSProperties = {
  margin: "0 0 18px",
  color: "#475569",
  lineHeight: 1.9,
};

const backBtn: CSSProperties = {
  display: "inline-flex",
  textDecoration: "none",
  padding: "12px 16px",
  borderRadius: 12,
  color: "#fff",
  background: "#0f172a",
  fontWeight: 800,
};

const certificateCard: CSSProperties = {
  position: "relative",
  overflow: "hidden",
  maxWidth: 820,
  width: "100%",
  background: "#ffffff",
  borderRadius: 28,
  padding: "28px 24px",
  boxShadow: "0 30px 80px rgba(15,23,42,.14)",
  border: "1px solid rgba(15,23,42,.08)",
};

const topGlow: CSSProperties = {
  position: "absolute",
  width: 220,
  height: 220,
  top: -80,
  right: -60,
  borderRadius: "50%",
  background: "rgba(250,204,21,.18)",
  filter: "blur(40px)",
};

const bottomGlow: CSSProperties = {
  position: "absolute",
  width: 240,
  height: 240,
  bottom: -90,
  left: -60,
  borderRadius: "50%",
  background: "rgba(34,197,94,.14)",
  filter: "blur(45px)",
};

const certHeader: CSSProperties = {
  position: "relative",
  zIndex: 1,
  textAlign: "center",
};

const certBadge: CSSProperties = {
  display: "inline-flex",
  padding: "8px 14px",
  borderRadius: 999,
  background: "rgba(250,204,21,.18)",
  color: "#854d0e",
  fontWeight: 900,
  marginBottom: 14,
};

const certTitle: CSSProperties = {
  margin: 0,
  fontSize: "clamp(26px, 4vw, 38px)",
  fontWeight: 900,
  color: "#0f172a",
};

const certSub: CSSProperties = {
  marginTop: 8,
  color: "#64748b",
  fontWeight: 700,
};

const divider: CSSProperties = {
  height: 1,
  background: "linear-gradient(90deg, transparent, rgba(15,23,42,.15), transparent)",
  margin: "20px 0",
};

const certBody: CSSProperties = {
  position: "relative",
  zIndex: 1,
  textAlign: "center",
};

const lead: CSSProperties = {
  color: "#475569",
  fontSize: 17,
  margin: "8px 0",
};

const studentNameStyle: CSSProperties = {
  margin: "12px 0",
  fontSize: "clamp(26px, 4vw, 38px)",
  color: "#111827",
  fontWeight: 900,
};

const topicTitle: CSSProperties = {
  margin: "14px 0 18px",
  color: "#0f172a",
  fontSize: "clamp(20px, 3vw, 28px)",
  fontWeight: 800,
};

const scoreBox: CSSProperties = {
  display: "inline-block",
  minWidth: 180,
  padding: "16px 20px",
  borderRadius: 20,
  background: "linear-gradient(135deg, rgba(34,197,94,.12), rgba(56,189,248,.12))",
  border: "1px solid rgba(34,197,94,.18)",
  marginBottom: 18,
};

const scoreLabel: CSSProperties = {
  color: "#475569",
  fontWeight: 700,
  marginBottom: 6,
};

const scoreValue: CSSProperties = {
  color: "#16a34a",
  fontSize: 32,
  fontWeight: 900,
};

const metaRow: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: 12,
  marginTop: 10,
};

const metaBox: CSSProperties = {
  padding: 14,
  borderRadius: 18,
  background: "rgba(15,23,42,.04)",
  border: "1px solid rgba(15,23,42,.08)",
};

const metaLabel: CSSProperties = {
  color: "#64748b",
  marginBottom: 8,
  fontSize: 14,
};

const metaValue: CSSProperties = {
  color: "#0f172a",
  fontWeight: 900,
  fontSize: 18,
};

const certFooter: CSSProperties = {
  position: "relative",
  zIndex: 1,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "end",
  gap: 16,
  flexWrap: "wrap",
};

const signBox: CSSProperties = {
  minWidth: 180,
};

const signLine: CSSProperties = {
  height: 1,
  background: "#0f172a",
  marginBottom: 8,
};

const signText: CSSProperties = {
  color: "#475569",
  fontWeight: 700,
};

const printBtn: CSSProperties = {
  padding: "12px 18px",
  borderRadius: 14,
  border: "none",
  cursor: "pointer",
  color: "#04111d",
  fontWeight: 900,
  background: "linear-gradient(135deg,#facc15 0%, #fde68a 100%)",
  boxShadow: "0 10px 24px rgba(250,204,21,.24)",
};
