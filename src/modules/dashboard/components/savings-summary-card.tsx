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
      <div className="flex items-center gap-[.65rem]">
        <span className="grid size-[2.35rem] place-items-center rounded-[.7rem] bg-surface-subtle text-primary-700 dark:text-[#93c5fd] [&_svg]:size-[1.15rem]">
          <PiggyBank aria-hidden="true" />
        </span>
        <div>
          <p className={`${eyebrowClass} mb-0`}>Tabungan</p>
          <h2 className="m-0 text-[1.05rem] tracking-[-.02em]">
            Ringkasan tabungan
          </h2>
        </div>
      </div>

      {!hasSavings ? (
        <div className="mt-[1rem] rounded-[.8rem] border border-dashed border-border bg-surface-subtle p-[1.1rem] text-center text-[.82rem] text-muted">
          Belum ada tabungan.
        </div>
      ) : (
        <dl className="mt-[.9rem] m-0 grid gap-0">
          <div className="grid gap-[.25rem] border-b border-border p-[.75rem_0]">
            <dt className="text-[.75rem] text-muted">Saldo tabungan</dt>
            <dd className="m-0 font-medium [overflow-wrap:anywhere]">
              {formatIdr(balance)}
            </dd>
          </div>
          <div className="grid gap-[.25rem] p-[.75rem_0]">
            <dt className="text-[.75rem] text-muted">
              Tersimpan periode ini
            </dt>
            <dd className={`m-0 font-medium [overflow-wrap:anywhere] ${net.tone}`}>
              {net.text}
            </dd>
          </div>
        </dl>
      )}
      <p className="mt-auto m-0 pt-[1.1rem] text-[.76rem] text-muted">
        Mencakup seluruh akun bertipe tabungan.
      </p>
    </section>
  );
}