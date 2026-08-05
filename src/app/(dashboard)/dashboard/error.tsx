"use client";

import { useEffect } from "react";

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
    <div className="state-panel" role="alert">
      <h1>Dashboard belum dapat dimuat</h1>
      <p>Data pribadi Anda tetap aman. Silakan coba kembali.</p>
      <button className="button button-primary" onClick={reset} type="button">
        Coba lagi
      </button>
    </div>
  );
}
