import Link from "next/link";
import { cardClass, eyebrowClass } from "@/components/ui/styles";
import { cn } from "@/lib/utils";
import { formatIdr } from "@/lib/money/format-idr";

export function AccountSummary({ total }: { total: bigint }) {
  return (
    <section
      className={`${cardClass} grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-4 max-[540px]:grid-cols-1`}
      aria-labelledby="account-summary-title"
    >
      <div>
        <p className={eyebrowClass}>Akun aktif</p>
        <h2 id="account-summary-title" className="m-[.15rem_0_0]">
          Total saldo
        </h2>
      </div>
      <strong
        className={cn(
          "text-[clamp(1.35rem,2.7vw,2rem)] [overflow-wrap:anywhere]",
          total < 0n ? "text-expense!" : undefined,
        )}
      >
        {formatIdr(total)}
      </strong>
      {total < 0n ? (
        <p className="m-0 font-medium text-expense!">Total saldo akun aktif negatif.</p>
      ) : null}
      <Link href="/accounts">Lihat akun</Link>
    </section>
  );
}
