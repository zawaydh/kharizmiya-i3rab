import { Suspense } from "react";
import CertificateClient from "./CertificateClient";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <CertificateClient />
    </Suspense>
  );
}
