import { notFound, redirect } from "next/navigation";
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
      <div className="page-heading-copy">
        <h2 className="entity-heading">{source.bill.merchantName}</h2>
        <p className="page-description">Simpan perubahan sebelum finalisasi. Draft memakai pemeriksaan revisi untuk mencegah timpa data.</p>
      </div>
      <SplitBillEditor
        action={updateSplitBillAction}
        finalizeAction={finalizeSplitBillAction}
        deleteAction={deleteSplitBillDraftAction}
        initial={serializeOwnedSplitBillSource(source)}
      />
    </div>
  );
}
