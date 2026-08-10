"use client";

import { useEffect } from "react";
import { reportClientError } from "../../lib/clientErrorReporting";

export default function ClientErrorMonitor(): null {
  useEffect(() => {
    const onError = (event: ErrorEvent) => {
      void reportClientError({
        source: "window-error",
        message: event.error instanceof Error ? event.error.message : event.message,
      });
    };
    const onUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      void reportClientError({
        source: "unhandled-rejection",
        message: reason instanceof Error ? reason.message : reason,
      });
    };

    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onUnhandledRejection);
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onUnhandledRejection);
    };
  }, []);

  return null;
}
