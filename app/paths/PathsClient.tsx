"use client";

import { useSearchParams } from "next/navigation";

export default function PathsClient() {
  const searchParams = useSearchParams();

  return (
    <div>
      صفحة المسارات تعمل الآن ✅
    </div>
  );
}