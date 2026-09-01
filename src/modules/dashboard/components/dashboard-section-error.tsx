import { CircleAlert } from "lucide-react";
import { cardClass } from "@/components/ui/styles";

export function DashboardSectionError({
  title,
}: {
  title: string;
}) {
  return (
    <section className={`${cardClass} flex items-center gap-[.8rem] shadow-none`} role="status">
      <CircleAlert aria-hidden="true" className="shrink-0 text-warning" />
      <div>
        <h2 className="m-0 mb-[.25rem] text-[1rem]">{title}</h2>
        <p className="m-0 text-[.84rem] text-muted">This section is not available yet. Try refreshing the page in a moment.</p>
      </div>
    </section>
  );
}
