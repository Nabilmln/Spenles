"use client";

import { useEffect } from "react";
import { ErrorState } from "./error-state";

export function PrivateDataError({
  error,
  reset,
  subject,
}: {
  error: Error & { digest?: string };
  reset: () => void;
  subject: string;
}) {
  useEffect(() => {
    void error.digest;
  }, [error]);
  return (
    <ErrorState
      title={`${subject} belum dapat dimuat`}
      message="Data pribadi Anda tetap aman. Silakan coba kembali."
      retry={reset}
    />
  );
}
