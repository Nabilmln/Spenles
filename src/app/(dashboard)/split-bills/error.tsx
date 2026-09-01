"use client";

import { ErrorState } from "@/components/feedback/error-state";

export default function SplitBillsError({
  reset,
}: {
  reset: () => void;
}) {
  return (
    <ErrorState
      title="Split bill could not be loaded"
      message="Private data is not shown. Try reloading."
      retry={reset}
    />
  );
}
