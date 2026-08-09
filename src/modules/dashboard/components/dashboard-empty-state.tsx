import Link from "next/link";
import { ReceiptText } from "lucide-react";
import { buttonClass, cardClass, emptyIconClass } from "@/components/ui/styles";

export function DashboardEmptyState() {
  return (
    <section
      className={`${cardClass} grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 border-dashed shadow-none max-[540px]:grid-cols-[auto_minmax(0,1fr)]`}
      role="status"
    >
      <span className={emptyIconClass}><ReceiptText /></span>
      <div>
        <h2 className="m-0 mb-[.25rem] text-[1rem]">Belum ada aktivitas pada periode ini</h2>
        <p className="m-0 text-[.84rem] text-muted">
          Tambahkan pemasukan atau pengeluaran agar ringkasan arus kas mulai
          terbentuk.
        </p>
      </div>
      <Link
        className={`${buttonClass("primary")} max-[540px]:col-span-full max-[540px]:w-full`}
        href="/transactions/new"
      >
        Tambah transaksi
      </Link>
    </section>
  );
}
