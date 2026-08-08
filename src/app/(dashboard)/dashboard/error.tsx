"use client";

import { useEffect } from "react";
import { buttonClass, statePanelClass } from "@/components/ui/styles";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    void error.digest;
  }, [error]);

  return (
    <div className={statePanelClass} role="alert">
      <h1>Dashboard belum dapat dimuat</h1>
      <p className="m-0 text-muted">Data pribadi Anda tetap aman. Silakan coba kembali.</p>
      <button className={buttonClass("primary")} onClick={reset} type="button">
        Coba lagi
      </button>
    </div>
  );
}
