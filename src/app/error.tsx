"use client";

import { ErrorState } from "@/components/feedback/error-state";
import { statePanelClass } from "@/components/ui/styles";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main className={statePanelClass}><ErrorState message="Layanan sedang mengalami kendala. Tidak ada data sensitif yang ditampilkan." retry={reset} /></main>;
}
