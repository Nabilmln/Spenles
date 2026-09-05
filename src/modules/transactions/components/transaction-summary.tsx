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
      className="mt-2 grid grid-cols-3 gap-[.4rem]"
    >
      {cards.map((card) => (
        <article
          className={cn(cardClass, "grid min-w-0 justify-items-center text-center shadow-none")}
          key={card.key}
        >
          <p className="m-0 text-[.68rem] font-medium text-foreground">
            {card.label}
          </p>
          <strong className="wrap-anywhere text-[.65rem] tracking-[-.01em] text-foreground [overflow-wrap:anywhere]">
            {values[card.key]}
          </strong>
        </article>
      ))}
    </section>
  );
}