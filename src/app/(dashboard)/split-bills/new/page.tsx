import { requireSessionUser } from "@/lib/auth/require-session";
import { formatJakartaDateTimeInput } from "@/lib/dates/jakarta";
import { narrowPageClass, pageDescriptionClass, pageStackClass } from "@/components/ui/styles";
import {
  createAndFinalizeSplitBillAction,
  createSplitBillAction,
  SplitBillEditor,
} from "@/modules/split-bills";

export const dynamic = "force-dynamic";

export default async function NewSplitBillPage() {
  await requireSessionUser();
  return (
    <div className={`${pageStackClass} ${narrowPageClass}`}>
      <p className={pageDescriptionClass}>Add participants and fill in each of their items. The preview is local; the server re-verifies all amounts.</p>
      <SplitBillEditor
        action={createSplitBillAction}
        finalizeAction={createAndFinalizeSplitBillAction}
        initial={{
          merchantName: "",
          billDate: formatJakartaDateTimeInput(new Date()).slice(0, 10),
          note: "",
          discountMode: "none",
          fixedDiscountAmount: "0",
          discountBps: 0,
          billTaxMode: "percentage",
          fixedBillTaxAmount: "0",
          billTaxBps: 0,
          serviceChargeBps: 0,
          participants: [],
          items: [],
        }}
      />
    </div>
  );
}