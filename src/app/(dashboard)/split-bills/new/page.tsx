import { randomUUID } from "node:crypto";
import { SectionHeading } from "@/components/layout/section-heading";
import { requireSessionUser } from "@/lib/auth/require-session";
import { formatJakartaDateTimeInput } from "@/lib/dates/jakarta";
import {
  createSplitBillAction,
  SplitBillEditor,
} from "@/modules/split-bills";

export const metadata = { title: "Buat Split Bill" };
export const dynamic = "force-dynamic";

export default async function NewSplitBillPage() {
  await requireSessionUser();
  const participantId = randomUUID();
  return (
    <div className="page-stack">
      <SectionHeading
        eyebrow="Split Bill"
        title="Buat tagihan patungan"
        description="Pratinjau bersifat lokal; server memverifikasi ulang seluruh nominal."
      />
      <SplitBillEditor
        action={createSplitBillAction}
        initial={{
          merchantName: "",
          billDate: formatJakartaDateTimeInput(new Date()).slice(0, 10),
          note: "",
          discountMode: "none",
          fixedDiscountAmount: "0",
          discountBps: 0,
          billTaxBps: 0,
          serviceChargeBps: 0,
          participants: [{ id: participantId, name: "" }],
          items: [
            {
              id: randomUUID(),
              name: "",
              quantity: 1,
              unitPrice: "",
              itemTaxBps: 0,
              participantIds: [participantId],
            },
          ],
        }}
      />
    </div>
  );
}
