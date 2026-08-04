import { Brand } from "@/components/layout/brand";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="public-shell">
      <div className="public-brand">
        <Brand />
        <p>Catat lebih tenang. Pahami keuangan lebih jelas.</p>
      </div>
      <section className="auth-card">{children}</section>
    </main>
  );
}
