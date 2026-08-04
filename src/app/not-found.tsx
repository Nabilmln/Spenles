import Link from "next/link";
import { Card } from "@/components/ui/card";

export default function NotFound() {
  return (
    <main className="centered-page">
      <Card className="not-found-card">
        <p className="eyebrow">404</p>
        <h1>Halaman tidak ditemukan</h1>
        <p>Alamat yang Anda buka tidak tersedia di Spenles.</p>
        <Link className="text-link" href="/">Kembali ke beranda</Link>
      </Card>
    </main>
  );
}
