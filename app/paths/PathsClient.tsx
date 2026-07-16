"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import AuthLockGate from "../components/AuthLockGate";
import DynamicPathTree from "../components/DynamicPathTree";
import { getTopicByCode } from "../../lib/topics";

const PATH_TOPIC_CODES = new Set([
  "nominal-advanced", "khabar", "kana-wa-akhawatuha", "inna-wa-akhawatuha",
  "past-verb", "present-verb", "imperative-verb", "fael", "mafool-bih",
]);

export default function PathsClient() {
  const searchParams = useSearchParams();
  const requestedTopic = searchParams.get("topic") || "nominal-advanced";
  const topic = useMemo(() => {
    const safeCode = PATH_TOPIC_CODES.has(requestedTopic) ? requestedTopic : "nominal-advanced";
    return getTopicByCode(safeCode) || getTopicByCode("nominal-advanced");
  }, [requestedTopic]);

  return (
    <AuthLockGate
      title="صفحة المسارات تفتح بعد تسجيل الدخول"
      text="المسارات التفاعلية متاحة بعد تسجيل الدخول، ثم يمكن للطالب متابعة التعلّم والتدرّب والاختبار."
    >
      <div className="paths-embed-page mubtada-paths-page paths-direct-workspace">
        {topic?.tree && topic?.examples ? (
          <DynamicPathTree
            key={topic.code}
            tree={topic.tree}
            examples={topic.examples}
            title={topic.name_ar}
            subtitle={topic.subtitle}
          />
        ) : (
          <section className="card"><p className="p">هذا الموضوع غير جاهز بعد.</p></section>
        )}
      </div>
    </AuthLockGate>
  );
}
