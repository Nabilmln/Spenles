import { cn } from "@/lib/utils";
import { formatIdr } from "@/lib/money/format-idr";

export type BillAmountSummaryValues = {
  subtotal: string;
  discount: string;
  itemTax: string;
  billTax: string;
  serviceCharge: string;
  total: string;
};

export function AmountRow({
  label,
  value,
  valueClass,
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="m-0 text-[.82rem] text-muted">{label}</dt>
      <dd className={cn("m-0 wrap-anywhere text-[.85rem]", valueClass ?? "font-medium")}>
        {formatIdr(value)}
      </dd>
    </div>
  );
}

export function BillAmountSummary({
  amounts,
  className,
}: {
  amounts: BillAmountSummaryValues;
  className?: string;
}) {
  const showDiscount = BigInt(amounts.discount) > 0n;
  const showItemTax = BigInt(amounts.itemTax) > 0n;
  const showBillTax = BigInt(amounts.billTax) > 0n;
  const showServiceCharge = BigInt(amounts.serviceCharge) > 0n;

  return (
    <dl
      className={cn(
        "m-0 grid gap-[.45rem] rounded-[.75rem] border border-border bg-surface-subtle px-[.9rem] py-[.85rem]",
        className,
      )}
    >
      <AmountRow label="Subtotal" value={amounts.subtotal} />
      {showDiscount ? (
        <AmountRow label="Discount" value={`-${amounts.discount}`} />
      ) : null}
      {showItemTax ? <AmountRow label="Item tax" value={amounts.itemTax} /> : null}
      {showBillTax ? <AmountRow label="Bill tax" value={amounts.billTax} /> : null}
      {showServiceCharge ? (
        <AmountRow label="Service charge" value={amounts.serviceCharge} />
      ) : null}
      <div className="flex items-baseline justify-between gap-4 border-t border-border pt-[.65rem]">
        <dt className="m-0 text-[.85rem] font-medium text-foreground">Total</dt>
        <dd className="m-0 font-semibold wrap-anywhere">{formatIdr(amounts.total)}</dd>
      </div>
    </dl>
  );
}