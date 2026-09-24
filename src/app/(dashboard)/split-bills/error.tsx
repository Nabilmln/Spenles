"use client";

import { useEffect } from "react";
import { reloadApp, reportClientError } from "@/components/feedback/error-retry";
import { ErrorState } from "@/components/feedback/error-state";

export default function SplitBillsError({
  error,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    reportClientError(error);
  }, [error]);

  return (
    <ErrorState
      title="Split bill could not be loaded"
      message="Private data is not shown. Try reloading."
      retry={reloadApp}
      digest={error.digest}
    />
  );
}