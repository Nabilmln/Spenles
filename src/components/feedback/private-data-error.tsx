"use client";

import { reloadApp } from "./error-retry";
import { ErrorState } from "./error-state";

export function PrivateDataError({
  error,
  subject,
}: {
  error?: Error & { digest?: string };
  subject: string;
}) {
  return (
    <ErrorState
      title={`${subject} could not be loaded`}
      message="Your private data remains safe. Please try again."
      retry={reloadApp}
      digest={error?.digest}
    />
  );
}
