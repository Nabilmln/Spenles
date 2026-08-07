import { SectionHeading } from "@/components/layout/section-heading";
import { requireSessionUser } from "@/lib/auth/require-session";
import { formatJakartaDateTimeInput } from "@/lib/dates/jakarta";
import {
  createSplitBillAction,
  SplitBillCreateFlow,
} from "@/modules/split-bills";

export const metadata = { title: "Buat Split Bill" };
export const dynamic = "force-dynamic";

export default async function NewSplitBillPage() {
  await requireSessionUser();
  return (
    <div className="page-stack narrow-page">
      <SectionHeading
        eyebrow="Split Bill"
        title="Buat tagihan patungan"
        description="Tambah peserta lalu isi barang masing-masing. Pratinjau bersifat lokal; server memverifikasi ulang seluruh nominal."
      />
      <SplitBillCreateFlow
        action={createSplitBillAction}
        initialDate={formatJakartaDateTimeInput(new Date()).slice(0, 10)}
      />
    </div>
  );
}