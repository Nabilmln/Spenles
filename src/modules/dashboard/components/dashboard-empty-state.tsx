import Link from "next/link";
import { ReceiptText } from "lucide-react";
import { buttonClass } from "@/components/ui/styles";

export function DashboardEmptyState() {
  return (
    <section className="dashboard-empty card" role="status">
      <span className="empty-icon"><ReceiptText /></span>
      <div>
        <h2>Belum ada aktivitas pada periode ini</h2>
        <p>
          Tambahkan pemasukan atau pengeluaran agar ringkasan arus kas mulai
          terbentuk.
        </p>
      </div>
      <Link className={buttonClass("primary")} href="/transactions/new">
        Tambah transaksi
      </Link>
    </section>
  );
}
