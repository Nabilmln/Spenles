import Link from "next/link";
import { SectionHeading } from "@/components/layout/section-heading";
import { requireSessionUser } from "@/lib/auth/require-session";
import {
  listOwnedSplitBills,
  parseSplitBillFilters,
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
          Buat split bill
        </Link>
      </div>
      <form className="card filter-panel split-filter-panel">
        <div className="field">
          <label htmlFor="split-search">Merchant</label>
          <input
            className="input"
            id="split-search"
            name="q"
            defaultValue={parsed.data.q}
            maxLength={100}
          />
        </div>
        <div className="field">
          <label htmlFor="split-status">Status</label>
          <select
            className="input"
            id="split-status"
            name="status"
            defaultValue={parsed.data.status ?? ""}
          >
            <option value="">Aktif</option>
            <option value="draft">Draft</option>
            <option value="finalized">Final</option>
            <option value="archived">Arsip</option>
            <option value="all">Semua</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="split-month">Bulan tagihan</label>
          <input
            className="input"
            id="split-month"
            name="month"
            type="month"
            defaultValue={parsed.data.month}
          />
        </div>
        <input type="hidden" name="pageSize" value={parsed.data.pageSize} />
        <button className="button button-secondary" type="submit">
          Terapkan
        </button>
      </form>
      <SplitBillList {...result} filters={parsed.data} />
    </div>
  );
}
