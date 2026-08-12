import { PiggyBank } from "lucide-react";
import { cardClass, eyebrowClass } from "@/components/ui/styles";
import { formatIdr } from "@/lib/money/format-idr";

function netLabel(net: bigint) {
  if (net > 0n) return { text: `+ ${formatIdr(net)}`, tone: "text-income" };
  if (net < 0n) return { text: `- ${formatIdr(-net)}`, tone: "text-expense" };
  return { text: "Rp 0", tone: "text-muted" };
}

export function SavingsSummaryCard({
  balance,
  periodNet,
}: {
  balance: bigint;
  periodNet: bigint;
}) {
  const hasSavings = balance > 0n || periodNet > 0n;
  const net = netLabel(periodNet);

  return (
    <section
      aria-label="Ringkasan tabungan"
      className={`${cardClass} flex h-full flex-col shadow-none`}
    >
      <div className="flex items-center gap-[.5rem]">
        <span className="grid size-[2rem] place-items-center rounded-[.55rem] bg-primary-50 text-primary-600 dark:text-primary-700 [&_svg]:size-[1rem]">
          <PiggyBank aria-hidden="true" />
        </span>
        <div>
          <p className={`${eyebrowClass} mb-0`}>Tabungan</p>
          <h2 className="m-0 text-[.88rem] tracking-[-.02em]">
            Ringkasan tabungan
          </h2>
        </div>
      </div>

      {!hasSavings ? (
        <div className="mt-[.75rem] rounded-[.65rem] border border-dashed border-border bg-surface-subtle p-[.85rem] text-center text-[.76rem] text-muted">
          Belum ada tabungan.
        </div>
      ) : (
        <dl className="mt-[.7rem] m-0 grid gap-0">
          <div className="grid gap-[.15rem] border-b border-border p-[.55rem_0]">
            <dt className="text-[.7rem] text-muted">Saldo tabungan</dt>
            <dd className="m-0 text-[.9rem] font-medium [overflow-wrap:anywhere]">
              {formatIdr(balance)}
            </dd>
          </div>
          <div className="grid gap-[.15rem] p-[.55rem_0]">
            <dt className="text-[.7rem] text-muted">
              Tersimpan periode ini
            </dt>
            <dd className={`m-0 text-[.9rem] font-medium [overflow-wrap:anywhere] ${net.tone}`}>
              {net.text}
            </dd>
          </div>
        </dl>
      )}
      <p className="mt-auto m-0 pt-[.85rem] text-[.7rem] text-muted">
        Mencakup seluruh akun bertipe tabungan.
      </p>
    </section>
  );
}