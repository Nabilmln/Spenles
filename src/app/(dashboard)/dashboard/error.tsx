"use client";

import { useEffect } from "react";
import { reloadApp, reportClientError } from "@/components/feedback/error-retry";
import { buttonClass, statePanelClass } from "@/components/ui/styles";

export default function DashboardError({
  error,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    reportClientError(error);
  }, [error]);

  return (
    <div className={statePanelClass} role="alert">
      <h1>Dashboard belum dapat dimuat</h1>
      <p className="m-0 text-muted">
        Data pribadi Anda tetap aman. Silakan coba kembali.
      </p>
      <button
        className={buttonClass("primary")}
        onClick={reloadApp}
        type="button"
      >
        Coba lagi
      </button>
      {error.digest ? (
        <p className="m-0 text-muted font-mono text-xs">
          Kode error: {error.digest}
        </p>
      ) : null}
    </div>
  );
}