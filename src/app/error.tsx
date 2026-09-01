"use client";

import { ErrorState } from "@/components/feedback/error-state";
import { statePanelClass } from "@/components/ui/styles";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main className={statePanelClass}><ErrorState message="The service is experiencing issues. No sensitive data is shown." retry={reset} /></main>;
}
