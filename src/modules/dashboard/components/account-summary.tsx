import Link from "next/link";
import { formatIdr } from "@/lib/money/format-idr";

export function AccountSummary({ total }: { total: bigint }) {
  return (
    <section
      className="card account-summary"
      aria-labelledby="account-summary-title"
    >
      <div>
        <p className="eyebrow">Akun aktif</p>
        <h2 id="account-summary-title">Total saldo</h2>
      </div>
      <strong className={total < 0n ? "negative-balance" : undefined}>
        {formatIdr(total)}
      </strong>
      {total < 0n ? (
        <p className="warning-copy">Total saldo akun aktif negatif.</p>
      ) : null}
      <Link href="/accounts">Lihat akun</Link>
    </section>
  );
}
