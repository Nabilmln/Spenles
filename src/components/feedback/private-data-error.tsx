"use client";

import { ErrorState } from "./error-state";

export function PrivateDataError({
  reset,
  subject,
}: {
  reset: () => void;
  subject: string;
}) {
  return (
    <ErrorState
      title={`${subject} could not be loaded`}
      message="Your private data remains safe. Please try again."
      retry={reset}
    />
  );
}
