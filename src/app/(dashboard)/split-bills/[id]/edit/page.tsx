import { notFound, redirect } from "next/navigation";
import { requireSessionUser } from "@/lib/auth/require-session";
import { narrowPageClass, pageStackClass } from "@/components/ui/styles";
import { listFriends } from "@/modules/friends";
import {
  getOwnedSplitBillSource,
  MakeBillWizard,
  splitBillIdSchema,
} from "@/modules/split-bills";

export const dynamic = "force-dynamic";

export default async function EditSplitBillPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireSessionUser();
  const parsedId = splitBillIdSchema.safeParse((await params).id);
  if (!parsedId.success) notFound();
  const source = await getOwnedSplitBillSource(user.id, parsedId.data);
  if (!source) notFound();
  if (source.bill.status !== "draft") redirect("/split-bills");
  const friends = await listFriends(user.id);
  return (
    <div className={`${pageStackClass} ${narrowPageClass}`}>
      <MakeBillWizard
        friends={friends}
        initial={{
          id: source.bill.id,
          revision: source.bill.revision,
          merchantName: source.bill.merchantName,
          billDate: source.bill.billDate,
          note: source.bill.note ?? "",
          billTaxMode: source.bill.billTaxMode,
          fixedBillTaxAmount: source.bill.fixedBillTaxAmount.toString(),
          billTaxBps: source.bill.billTaxBps,
          participants: source.participants.map((participant) => ({
            id: participant.id,
            name: participant.name,
          })),
          items: source.items.map((item) => ({
            id: item.id,
            name: item.name,
            quantity: item.quantity,
            unitPrice: item.unitPrice.toString(),
            participantIds: source.assignments
              .filter((assignment) => assignment.itemId === item.id)
              .map((assignment) => assignment.participantId),
          })),
        }}
      />
    </div>
  );
}
