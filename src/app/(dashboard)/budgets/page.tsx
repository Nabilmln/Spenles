import Link from "next/link";
import { requireSessionUser } from "@/lib/auth/require-session";
import { BudgetList, listOwnedBudgets } from "@/modules/budgets";

export const metadata = { title: "Anggaran" };
export const dynamic = "force-dynamic";

export default async function BudgetsPage() {
  const user = await requireSessionUser();
  const rows = await listOwnedBudgets(user.id);
  return (
    <div className="page-stack">
      <div className="page-heading-row">
        <p className="page-description">Pemakaian dihitung dari transaksi pengeluaran aktif dalam bulan Jakarta.</p>
        <Link className="button button-primary" href="/budgets/new">Buat anggaran</Link>
      </div>
      <BudgetList rows={rows} />
    </div>
  );
}
