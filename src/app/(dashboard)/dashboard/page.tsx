import { ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/feedback/empty-state";
import { SectionHeading } from "@/components/layout/section-heading";
import { requireSessionUser } from "@/lib/auth/require-session";
import { getProfile } from "@/modules/profiles";

export const metadata = { title: "Beranda" };
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await requireSessionUser();
  const profile = await getProfile(user.id);
  return (
    <div className="page-stack">
      <SectionHeading eyebrow="Fase 01 · Fondasi" title={`Halo, ${profile?.displayName ?? "Pengguna Spenles"}`} description="Ruang keuangan pribadi Anda sudah aman dan siap digunakan." />
      <div className="foundation-grid">
        <Card><span className="card-icon blue"><ShieldCheck /></span><h2>Akun terlindungi</h2><p>Sesi dan setiap data pribadi terikat ke identitas Anda.</p></Card>
        <Card><span className="card-icon green"><Sparkles /></span><h2>Fondasi siap</h2><p>Kategori awal dan Kas Utama sudah dipersiapkan otomatis.</p></Card>
        <Card><span className="card-icon amber"><ArrowRight /></span><h2>Langkah berikutnya</h2><p>Fitur transaksi akan hadir di fase berikutnya, bukan pada fondasi ini.</p></Card>
      </div>
      <EmptyState />
    </div>
  );
}
