import { formatIdr } from "@/lib/money/format-idr";

const paymentLabel = {
  unpaid: "Belum dibayar",
  partially_paid: "Dibayar sebagian",
  paid: "Lunas",
} as const;

export function createSplitBillShareSummary(input: {
  merchantName: string;
  billDate: string;
  finalAmount: string;
  participants: {
    name: string;
    finalAmount: string;
    paymentStatus: keyof typeof paymentLabel;
  }[];
  includePaymentStatus: boolean;
}) {
  const participantLines = input.participants.map(
    (participant, index) =>
      `${index + 1}. ${participant.name}: ${formatIdr(participant.finalAmount)}${
        input.includePaymentStatus
          ? ` — ${paymentLabel[participant.paymentStatus]}`
          : ""
      }`,
  );
  return [
    `Patungan ${input.merchantName}`,
    `Tanggal: ${new Intl.DateTimeFormat("id-ID", {
      dateStyle: "long",
      timeZone: "Asia/Jakarta",
    }).format(new Date(`${input.billDate}T00:00:00+07:00`))}`,
    `Total: ${formatIdr(input.finalAmount)}`,
    "",
    ...participantLines,
    "",
    "Dihitung dengan Spenles.",
  ].join("\n");
}
