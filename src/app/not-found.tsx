import Link from "next/link";
import { Card } from "@/components/ui/card";
import { eyebrowClass, statePanelClass, textLinkClass } from "@/components/ui/styles";

export default function NotFound() {
  return (
    <main className={statePanelClass}>
      <Card className="max-w-[28rem] text-left">
        <p className={eyebrowClass}>404</p>
        <h1 className="mb-[.4rem] text-[clamp(1.75rem,4vw,2.35rem)] leading-[1.15] tracking-[-.04em]">Halaman tidak ditemukan</h1>
        <p className="text-[.88rem] text-muted">Alamat yang Anda buka tidak tersedia di Spenles.</p>
        <Link className={textLinkClass} href="/">Kembali ke beranda</Link>
      </Card>
    </main>
  );
}
