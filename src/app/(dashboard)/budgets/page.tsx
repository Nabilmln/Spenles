import Link from "next/link";
import { requireSessionUser } from "@/lib/auth/require-session";
import { buttonClass, pageDescriptionClass, pageHeadingRowClass, pageStackClass } from "@/components/ui/styles";
import { BudgetList, listOwnedBudgets } from "@/modules/budgets";

export const dynamic = "force-dynamic";

export default async function BudgetsPage() {
  const user = await requireSessionUser();
  const rows = await listOwnedBudgets(user.id);
  return (
    <div className={pageStackClass}>
      <div className={pageHeadingRowClass}>
        <p className={pageDescriptionClass}>Pemakaian dihitung dari transaksi pengeluaran aktif dalam bulan Jakarta.</p>
        <Link className={buttonClass("primary")} href="/budgets/new">Buat anggaran</Link>
      </div>
      <BudgetList rows={rows} />
    </div>
  );
}
