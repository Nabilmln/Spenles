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
      <p className={pageDescriptionClass}>Tambah peserta lalu isi barang masing-masing. Pratinjau bersifat lokal; server memverifikasi ulang seluruh nominal.</p>
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
          billTaxBps: 0,
          serviceChargeBps: 0,
          participants: [],
          items: [],
        }}
      />
    </div>
  );
}