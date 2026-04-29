"use client";

import { useSearchParams } from "next/navigation";

export default function CertificateClient() {
  const searchParams = useSearchParams();

  return (
    <div>
      صفحة الشهادة تعمل الآن ✅
    </div>
  );
}