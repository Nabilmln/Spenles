import { LoaderCircle } from "lucide-react";
import { statePanelClass } from "@/components/ui/styles";

export function LoadingState({ label = "Loading..." }: { label?: string }) {
  return (
    <div className={statePanelClass} role="status">
      <LoaderCircle className="animate-spin" aria-hidden="true" />
      <p className="m-0 text-muted">{label}</p>
    </div>
  );
}
