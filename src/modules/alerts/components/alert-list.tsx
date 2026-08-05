import Link from "next/link";
import type { Phase04Alert } from "../queries/alerts";

export function AlertList({ alerts }: { alerts: Phase04Alert[] }) {
  if (alerts.length === 0) return null;
  return (
    <section
      className="alert-list"
      aria-label="Peringatan keuangan"
      aria-live="polite"
    >
      {alerts.map((alert) => (
        <article className={`alert-banner alert-${alert.tone}`} key={alert.id}>
          <div>
            <strong>{alert.title}</strong>
            <p>{alert.message}</p>
          </div>
          <Link href={alert.href}>Tinjau</Link>
        </article>
      ))}
    </section>
  );
}
