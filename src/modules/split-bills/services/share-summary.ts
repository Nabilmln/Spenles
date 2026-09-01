import { JAKARTA_TIMEZONE } from "@/lib/dates/jakarta";
import { formatIdr } from "@/lib/money/format-idr";

const paymentLabel = {
  unpaid: "Unpaid",
  partially_paid: "Partially paid",
  paid: "Paid",
} as const;

export function createSplitBillShareSummary(input: {
  merchantName: string;
  billDate: string;
  subtotalAmount: string;
  taxAmount: string;
  taxBps: number;
  taxMode: "percentage" | "fixed";
  finalAmount: string;
  participants: {
    name: string;
    finalAmount: string;
    paymentStatus: keyof typeof paymentLabel;
    items?: {
      name: string;
      unitPrice: string;
      quantity: number;
      amount: string;
    }[];
  }[];
  includePaymentStatus: boolean;
}) {
  const lines: string[] = [];
  lines.push(`Split Bill — ${input.merchantName}`);
  lines.push(
    new Intl.DateTimeFormat("en-US", {
      dateStyle: "long",
      timeZone: JAKARTA_TIMEZONE,
    }).format(new Date(`${input.billDate}T00:00:00+07:00`)),
  );
  for (const participant of input.participants) {
    const itemLines = (participant.items ?? []).map(
      (item) => `• ${item.name} — ${formatIdr(item.amount)}`,
    );
    const paymentSuffix = input.includePaymentStatus
      ? ` (${paymentLabel[participant.paymentStatus]})`
      : "";
    lines.push(
      `${participant.name}:${paymentSuffix}\n${itemLines.join("\n")}\nTotal: ${formatIdr(participant.finalAmount)}`,
    );
  }
  const taxLine =
    input.taxMode === "fixed"
      ? `Tax: ${formatIdr(input.taxAmount)}`
      : `Tax ${input.taxBps / 100}%: ${formatIdr(input.taxAmount)}`;
  lines.push(
    [
      `Subtotal: ${formatIdr(input.subtotalAmount)}`,
      taxLine,
      `Total: ${formatIdr(input.finalAmount)}`,
    ].join("\n"),
  );
  lines.push("Calculated with Spenles.");
  return lines.join("\n\n");
}