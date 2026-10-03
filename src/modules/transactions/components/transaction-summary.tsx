import { cn } from "@/lib/utils";
import { cardClass } from "@/components/ui/styles";
import { formatIdr } from "@/lib/money/format-idr";

const cards = [
  { key: "payment", label: "Payment" },
  { key: "income", label: "Income" },
  { key: "saving", label: "Saving" },
] as const;

function nominal(value: bigint) {
  return value < 0n ? `− ${formatIdr(-value)}` : formatIdr(value);
}

export function TransactionSummary({
  income,
  expense,
  savings,
}: {
  income: bigint;
  expense: bigint;
  savings: bigint;
}) {
  const values: Record<(typeof cards)[number]["key"], string> = {
    payment: nominal(expense),
    income: nominal(income),
    saving: nominal(savings),
  };

  return (
    <section
      aria-label="Period summary"
      className="mt-2 grid grid-cols-3 gap-[.2rem]"
    >
      {cards.map((card) => (
        <article
          className={cn(cardClass, "grid min-h-[4.35rem] min-w-0 content-center justify-items-center gap-1 px-1.5! text-center shadow-none")}
          key={card.key}
        >
          <p className="m-0 text-[.69rem] font-medium text-muted">
            {card.label}
          </p>
          <strong className="text-[clamp(.7rem,2.8vw,.87rem)] font-semibold leading-[1.2] tracking-[-.02em] text-foreground tabular-nums [overflow-wrap:anywhere]">
            {values[card.key]}
          </strong>
        </article>
      ))}
    </section>
  );
}
