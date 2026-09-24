"use client";

import { useEffect } from "react";
import { reloadApp, reportClientError } from "@/components/feedback/error-retry";
import { ErrorState } from "@/components/feedback/error-state";
import { statePanelClass } from "@/components/ui/styles";

export default function AppError({
  error,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    reportClientError(error);
  }, [error]);

  return (
    <main className={statePanelClass}>
      <ErrorState
        message="The service is experiencing issues. No sensitive data is shown."
        retry={reloadApp}
        digest={error.digest}
      />
    </main>
  );
}