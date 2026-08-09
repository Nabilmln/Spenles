import Link from "next/link";
import { textLinkClass } from "@/components/ui/styles";
import type { Phase04Alert } from "../queries/alerts";

const alertToneClasses: Record<string, string> = {
  warning:
    "border-[color-mix(in_srgb,var(--warning)_45%,var(--border))] bg-[color-mix(in_srgb,var(--warning)_8%,var(--surface))]",
  danger:
    "border-[color-mix(in_srgb,var(--expense)_35%,var(--border))] bg-[color-mix(in_srgb,var(--expense)_7%,var(--surface))]",
};

export function AlertList({ alerts }: { alerts: Phase04Alert[] }) {
  if (alerts.length === 0) return null;
  return (
    <section
      className="grid gap-[.65rem]"
      aria-label="Peringatan keuangan"
      aria-live="polite"
    >
      {alerts.map((alert) => (
        <article className={`flex items-center justify-between gap-4 rounded-[.8rem] border border-border p-[.9rem_1rem] max-[540px]:flex-col max-[540px]:items-start ${alertToneClasses[alert.tone] ?? ""}`} key={alert.id}>
          <div>
            <strong>{alert.title}</strong>
            <p className="m-[.25rem_0_0] text-[.8rem]">{alert.message}</p>
          </div>
          <Link className={textLinkClass} href={alert.href}>Tinjau</Link>
        </article>
      ))}
    </section>
  );
}
