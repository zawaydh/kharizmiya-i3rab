"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getTopicProgress } from "../../lib/db";
import { supabase } from "../../lib/supabaseClient";
import { getTopicByCode } from "../../lib/topics";
import { getQuizPercent, isCertificateEligible } from "../../lib/certificateEligibility";

export default function CertificateClient() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);
  const [data, setData] = useState({
    studentName: "الطالب",
    topicName: "الجملة الاسمية — المبتدأ",
    level: "المستوى المتوسط",
    scorePercent: 0,
    date: "",
  });

  useEffect(() => {
    async function load() {
      const topicId = searchParams.get("topicId") || "nominal-advanced";
      const levelParam = Number(searchParams.get("level") || 2);
      const topicMeta = getTopicByCode(topicId);
      try {
        const row = await getTopicProgress(topicId, levelParam);

        const {
          data: { user },
        } = await supabase.auth.getUser();

        const percent = getQuizPercent(row);
        const ok = isCertificateEligible(row);

        setAllowed(ok);

        const studentName =
          user?.user_metadata?.full_name || "الطالب";

        setData({
          studentName,
          topicName: topicMeta?.name_ar || topicId,
          level: levelParam === 1 ? "المستوى الأول" : "المستوى الثاني",
          scorePercent: percent,
          date: new Date().toLocaleDateString("ar-JO"),
        });
      } catch (e) {
        console.error("certificate load failed", e);
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

  if (!allowed) {
    return (
      <div className="certificate-print-page" style={centerWrap}>
        <div style={blockedCard}>
          <div style={blockedIcon}>🔒</div>
          <h2 style={blockedTitle}>لم تحقق شروط الشهادة بعد</h2>
          <p style={blockedText}>
            أكمل المراحل السابقة ثم عُد إلى الشهادة.
          </p>
          <a href="/dashboard" style={backBtn} className="print-hide">
            العودة إلى لوحة التقدم
          </a>
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
          <h1 style={certTitle}>منصة خوارزمية الإعراب</h1>
          <div style={certSub}>Certificate of Completion</div>
        </div>

        <div style={divider} />

        <div style={certBody}>
          <p style={lead}>تشهد منصة خوارزمية الإعراب بأن</p>

          <h2 style={studentNameStyle}>{data.studentName}</h2>

          <p style={lead}>قد أتم بنجاح مسار</p>

          <h3 style={topicTitle}>
            {data.topicName} — {data.level}
          </h3>

          <div style={scoreBox}>
            <div style={scoreLabel}>نسبة النجاح</div>
            <div style={scoreValue}>{data.scorePercent}%</div>
          </div>

          <div style={metaRow}>
            <div style={metaBox}>
              <div style={metaLabel}>تاريخ الإصدار</div>
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

          <button
            onClick={() => window.print()}
            style={printBtn}
            className="print-hide"
          >
            طباعة / حفظ PDF
          </button>
        </div>
      </div>
    </div>
  );
}

const pageWrap = {
  minHeight: "100vh",
  padding: "24px 16px",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  background:
    "radial-gradient(circle at top right, rgba(34,197,94,.12), transparent 30%), radial-gradient(circle at bottom left, rgba(56,189,248,.12), transparent 30%), #f8fafc",
};

const centerWrap = {
  minHeight: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: 16,
  background: "#f8fafc",
};

const loadingCard = {
  padding: 24,
  borderRadius: 18,
  background: "#ffffff",
  boxShadow: "0 20px 50px rgba(0,0,0,.08)",
  fontWeight: 800,
};

const blockedCard = {
  maxWidth: 520,
  width: "100%",
  padding: 28,
  borderRadius: 24,
  background: "#ffffff",
  textAlign: "center",
  boxShadow: "0 20px 50px rgba(0,0,0,.08)",
};

const blockedIcon = {
  fontSize: 34,
  marginBottom: 10,
};

const blockedTitle = {
  margin: "0 0 10px",
  color: "#0f172a",
};

const blockedText = {
  margin: "0 0 18px",
  color: "#475569",
  lineHeight: 1.9,
};

const backBtn = {
  display: "inline-flex",
  textDecoration: "none",
  padding: "12px 16px",
  borderRadius: 12,
  color: "#fff",
  background: "#0f172a",
  fontWeight: 800,
};

const certificateCard = {
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

const topGlow = {
  position: "absolute",
  width: 220,
  height: 220,
  top: -80,
  right: -60,
  borderRadius: "50%",
  background: "rgba(250,204,21,.18)",
  filter: "blur(40px)",
};

const bottomGlow = {
  position: "absolute",
  width: 240,
  height: 240,
  bottom: -90,
  left: -60,
  borderRadius: "50%",
  background: "rgba(34,197,94,.14)",
  filter: "blur(45px)",
};

const certHeader = {
  position: "relative",
  zIndex: 1,
  textAlign: "center",
};

const certBadge = {
  display: "inline-flex",
  padding: "8px 14px",
  borderRadius: 999,
  background: "rgba(250,204,21,.18)",
  color: "#854d0e",
  fontWeight: 900,
  marginBottom: 14,
};

const certTitle = {
  margin: 0,
  fontSize: "clamp(26px, 4vw, 38px)",
  fontWeight: 900,
  color: "#0f172a",
};

const certSub = {
  marginTop: 8,
  color: "#64748b",
  fontWeight: 700,
};

const divider = {
  height: 1,
  background: "linear-gradient(90deg, transparent, rgba(15,23,42,.15), transparent)",
  margin: "20px 0",
};

const certBody = {
  position: "relative",
  zIndex: 1,
  textAlign: "center",
};

const lead = {
  color: "#475569",
  fontSize: 17,
  margin: "8px 0",
};

const studentNameStyle = {
  margin: "12px 0",
  fontSize: "clamp(26px, 4vw, 38px)",
  color: "#111827",
  fontWeight: 900,
};

const topicTitle = {
  margin: "14px 0 18px",
  color: "#0f172a",
  fontSize: "clamp(20px, 3vw, 28px)",
  fontWeight: 800,
};

const scoreBox = {
  display: "inline-block",
  minWidth: 180,
  padding: "16px 20px",
  borderRadius: 20,
  background: "linear-gradient(135deg, rgba(34,197,94,.12), rgba(56,189,248,.12))",
  border: "1px solid rgba(34,197,94,.18)",
  marginBottom: 18,
};

const scoreLabel = {
  color: "#475569",
  fontWeight: 700,
  marginBottom: 6,
};

const scoreValue = {
  color: "#16a34a",
  fontSize: 32,
  fontWeight: 900,
};

const metaRow = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: 12,
  marginTop: 10,
};

const metaBox = {
  padding: 14,
  borderRadius: 18,
  background: "rgba(15,23,42,.04)",
  border: "1px solid rgba(15,23,42,.08)",
};

const metaLabel = {
  color: "#64748b",
  marginBottom: 8,
  fontSize: 14,
};

const metaValue = {
  color: "#0f172a",
  fontWeight: 900,
  fontSize: 18,
};

const certFooter = {
  position: "relative",
  zIndex: 1,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "end",
  gap: 16,
  flexWrap: "wrap",
};

const signBox = {
  minWidth: 180,
};

const signLine = {
  height: 1,
  background: "#0f172a",
  marginBottom: 8,
};

const signText = {
  color: "#475569",
  fontWeight: 700,
};

const printBtn = {
  padding: "12px 18px",
  borderRadius: 14,
  border: "none",
  cursor: "pointer",
  color: "#04111d",
  fontWeight: 900,
  background: "linear-gradient(135deg,#facc15 0%, #fde68a 100%)",
  boxShadow: "0 10px 24px rgba(250,204,21,.24)",
};