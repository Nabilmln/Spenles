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
            Reset filters
          </Link>
        </div>
      </div>
    );
  }
  const result = await listOwnedSplitBills(user.id, parsed.data);
  return (
    <div className={pageStackClass}>
      <div className={pageHeadingRowClass}>
        <p className={pageDescriptionClass}>Split items, discounts, tax, and service charges with exact rupiah reconciliation.</p>
        <Link className={buttonClass("primary")} href="/split-bills/new">
          Create Split Bill
        </Link>
      </div>
      <SplitBillFilterBar filters={parsed.data} />
      <SplitBillList {...result} filters={parsed.data} />
    </div>
  );
}