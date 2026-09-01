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
        <p className={pageDescriptionClass}>Usage is calculated from active expense transactions in the Jakarta month.</p>
        <Link className={buttonClass("primary")} href="/budgets/new">Create budget</Link>
      </div>
      <BudgetList rows={rows} />
    </div>
  );
}
