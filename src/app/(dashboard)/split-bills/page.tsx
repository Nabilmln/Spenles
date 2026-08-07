import Link from "next/link";
import { SectionHeading } from "@/components/layout/section-heading";
import { requireSessionUser } from "@/lib/auth/require-session";
import {
  listOwnedSplitBills,
  parseSplitBillFilters,
  SplitBillFilterBar,
  SplitBillList,
} from "@/modules/split-bills";

export const metadata = { title: "Split Bill" };
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
      <div className="page-stack">
        <SectionHeading
          eyebrow="Split Bill"
          title="Filter tidak valid"
          description="Parameter riwayat tidak dapat digunakan."
        />
        <div className="card">
          <Link className="button button-primary" href="/split-bills">
            Reset filter
          </Link>
        </div>
      </div>
    );
  }
  const result = await listOwnedSplitBills(user.id, parsed.data);
  return (
    <div className="page-stack">
      <div className="page-heading-row">
        <SectionHeading
          eyebrow="Split Bill"
          title="Tagihan patungan"
          description="Bagi item, diskon, pajak, dan biaya layanan dengan rekonsiliasi rupiah yang tepat."
        />
        <Link className="button button-primary" href="/split-bills/new">
          Buat Split Bill
        </Link>
      </div>
      <SplitBillFilterBar filters={parsed.data} />
      <SplitBillList {...result} filters={parsed.data} />
    </div>
  );
}