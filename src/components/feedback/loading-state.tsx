import { LoaderCircle } from "lucide-react";

export function LoadingState({ label = "Memuat..." }: { label?: string }) {
  return (
    <div className="state-panel" role="status">
      <LoaderCircle className="animate-spin" aria-hidden="true" />
      <p>{label}</p>
    </div>
  );
}
