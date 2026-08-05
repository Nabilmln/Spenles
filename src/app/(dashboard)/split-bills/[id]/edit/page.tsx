import { notFound, redirect } from "next/navigation";
import { SectionHeading } from "@/components/layout/section-heading";
import { requireSessionUser } from "@/lib/auth/require-session";
import {
  deleteSplitBillDraftAction,
  finalizeSplitBillAction,
  getOwnedSplitBillSource,
  serializeOwnedSplitBillSource,
  SplitBillEditor,
  splitBillIdSchema,
  updateSplitBillAction,
} from "@/modules/split-bills";

export const metadata = { title: "Edit Split Bill" };
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
  if (source.bill.status !== "draft") redirect(`/split-bills/${parsedId.data}`);
  return (
    <div className="page-stack">
      <SectionHeading
        eyebrow="Draft Split Bill"
        title={source.bill.merchantName}
        description="Simpan perubahan sebelum finalisasi. Draft memakai pemeriksaan revisi untuk mencegah timpa data."
      />
      <SplitBillEditor
        action={updateSplitBillAction}
        finalizeAction={finalizeSplitBillAction}
        deleteAction={deleteSplitBillDraftAction}
        initial={serializeOwnedSplitBillSource(source)}
      />
    </div>
  );
}
