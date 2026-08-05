import Link from "next/link";
import { SectionHeading } from "@/components/layout/section-heading";
import { requireSessionUser } from "@/lib/auth/require-session";
import {
  listOwnedRecurringRules,
  RecurringRuleList,
} from "@/modules/recurring-transactions";

export const metadata = { title: "Transaksi berulang" };
export const dynamic = "force-dynamic";

export default async function RecurringTransactionsPage() {
  const user = await requireSessionUser();
  const rows = await listOwnedRecurringRules(user.id);
  return (
    <div className="page-stack">
      <div className="page-heading-row">
        <SectionHeading
          eyebrow="Otomasi"
          title="Transaksi berulang"
          description="Jadwal menggunakan Asia/Jakarta dan setiap kejadian hanya dibuat sekali."
        />
        <Link className="button button-primary" href="/recurring-transactions/new">Buat aturan</Link>
      </div>
      <RecurringRuleList rows={rows} />
    </div>
  );
}
