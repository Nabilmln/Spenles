import Link from "next/link";
import { requireSessionUser } from "@/lib/auth/require-session";
import { buttonClass, cardClass, pageDescriptionClass, pageHeadingRowClass, pageStackClass } from "@/components/ui/styles";
import {
  listOwnedSplitBills,
  parseSplitBillFilters,
  SplitBillFilterBar,
  SplitBillList,
} from "@/modules/split-bills";

export const dynamic = "force-dynamic";

export default async function SplitBillsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requireSessionUser();
  const parsed = parseSplitBillFilters(await searchParams);
  if (!parsed.success) {
    return (
      <div className={pageStackClass}>
        <div className={cardClass}>
          <Link className={buttonClass("primary")} href="/split-bills">
            Reset filter
          </Link>
        </div>
      </div>
    );
  }
  const result = await listOwnedSplitBills(user.id, parsed.data);
  return (
    <div className={pageStackClass}>
      <div className={pageHeadingRowClass}>
        <p className={pageDescriptionClass}>Bagi item, diskon, pajak, dan biaya layanan dengan rekonsiliasi rupiah yang tepat.</p>
        <Link className={buttonClass("primary")} href="/split-bills/new">
          Buat Split Bill
        </Link>
      </div>
      <SplitBillFilterBar filters={parsed.data} />
      <SplitBillList {...result} filters={parsed.data} />
    </div>
  );
}