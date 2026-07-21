import { Suspense } from "react";
import AuthLockGate from "../components/AuthLockGate";
import PathsClient from "./PathsClient";

type PageProps = {
  searchParams?: { topic?: string | string[] };
};

export default function Page({ searchParams }: PageProps) {
  const rawTopic = Array.isArray(searchParams?.topic) ? searchParams?.topic[0] : searchParams?.topic;
  const nextHref = rawTopic ? `/paths?topic=${encodeURIComponent(rawTopic)}` : "/paths";

  return (
    <AuthLockGate
      title="سجّل الدخول لفتح المسار البصري"
      text="سجّل الدخول لفتح المسار."
      nextHref={nextHref}
    >
      <Suspense fallback={<div className="card auth-lock-card">جارٍ تجهيز المسار...</div>}>
        <PathsClient />
      </Suspense>
    </AuthLockGate>
  );
}
