import { Suspense } from "react";
import AuthLockGate from "../components/AuthLockGate";
import PathsClient from "./PathsClient";

export default function Page() {
  return (
    <AuthLockGate title="سجّل الدخول لفتح المسار البصري" text="سجّل الدخول لفتح المسار.">
      <Suspense fallback={null}>
        <PathsClient />
      </Suspense>
    </AuthLockGate>
  );
}
