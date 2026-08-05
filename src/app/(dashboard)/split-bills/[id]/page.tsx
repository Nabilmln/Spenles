import { notFound, redirect } from "next/navigation";
import { requireSessionUser } from "@/lib/auth/require-session";
import {
  getOwnedSplitBillDetail,
  SplitBillDetail,
  splitBillIdSchema,
} from "@/modules/split-bills";

export const metadata = { title: "Hasil Split Bill" };
export const dynamic = "force-dynamic";

export default async function SplitBillDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireSessionUser();
  const parsedId = splitBillIdSchema.safeParse((await params).id);
  if (!parsedId.success) notFound();
  const detail = await getOwnedSplitBillDetail(user.id, parsedId.data);
  if (!detail) notFound();
  if (detail.bill.status === "draft") {
    redirect(`/split-bills/${parsedId.data}/edit`);
  }
  if (!detail.calculation) notFound();
  const participantSource = new Map(
    detail.participants.map((participant) => [participant.id, participant]),
  );
  return (
    <SplitBillDetail
      detail={{
        id: detail.bill.id,
        merchantName: detail.calculation.merchantNameSnapshot,
        billDate: detail.calculation.billDateSnapshot,
        note: detail.calculation.noteSnapshot,
        status: detail.bill.status,
        calculationVersion: detail.calculation.calculationVersion,
        subtotalAmount: detail.calculation.subtotalAmount.toString(),
        discountAmount: detail.calculation.discountAmount.toString(),
        itemTaxAmount: detail.calculation.itemTaxAmount.toString(),
        billTaxAmount: detail.calculation.billTaxAmount.toString(),
        serviceChargeAmount:
          detail.calculation.serviceChargeAmount.toString(),
        finalAmount: detail.calculation.finalAmount.toString(),
        items: detail.itemResults.map((item) => ({
          id: item.sourceItemId,
          name: item.nameSnapshot,
          quantity: item.quantitySnapshot,
          unitPrice: item.unitPriceSnapshot.toString(),
          discountAmount: item.discountAmount.toString(),
          discountedAmount: item.discountedAmount.toString(),
          itemTaxAmount: item.itemTaxAmount.toString(),
          billTaxAmount: item.billTaxAmount.toString(),
        })),
        participants: detail.participantResults.map((participant) => {
          const source = participantSource.get(participant.sourceParticipantId);
          return {
            id: participant.sourceParticipantId,
            name: participant.nameSnapshot,
            itemAmount: participant.itemAmount.toString(),
            itemTaxAmount: participant.itemTaxAmount.toString(),
            billTaxAmount: participant.billTaxAmount.toString(),
            serviceChargeAmount: participant.serviceChargeAmount.toString(),
            finalAmount: participant.finalAmount.toString(),
            paymentStatus: source?.paymentStatus ?? "unpaid",
            paidAmount: source?.paidAmount.toString() ?? "0",
          };
        }),
      }}
    />
  );
}
