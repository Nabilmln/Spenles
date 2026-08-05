import { CircleAlert } from "lucide-react";

export function DashboardSectionError({
  title,
}: {
  title: string;
}) {
  return (
    <section className="dashboard-section-error card" role="status">
      <CircleAlert aria-hidden="true" />
      <div>
        <h2>{title}</h2>
        <p>Bagian ini belum dapat dimuat. Coba segarkan halaman beberapa saat lagi.</p>
      </div>
    </section>
  );
}
