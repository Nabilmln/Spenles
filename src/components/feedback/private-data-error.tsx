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
      title={`${subject} could not be loaded`}
      message="Your private data remains safe. Please try again."
      retry={reset}
    />
  );
}
