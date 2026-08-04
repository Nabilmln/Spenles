import { CircleDollarSign } from "lucide-react";

export function EmptyState() {
  return (
    <div className="empty-state">
      <span className="empty-icon">
        <CircleDollarSign size={28} aria-hidden="true" />
      </span>
      <div>
        <h2>Belum ada aktivitas keuangan</h2>
        <p>
          Fondasi akun Anda sudah siap. Pencatatan transaksi akan tersedia pada
          fase berikutnya.
        </p>
      </div>
    </div>
  );
}
