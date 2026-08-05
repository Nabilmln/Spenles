"use client";

import { ErrorState } from "@/components/feedback/error-state";

export default function SplitBillsError({
  reset,
}: {
  reset: () => void;
}) {
  return (
    <ErrorState
      title="Split bill belum dapat dimuat"
      message="Data privat tidak ditampilkan. Coba muat ulang."
      retry={reset}
    />
  );
}
