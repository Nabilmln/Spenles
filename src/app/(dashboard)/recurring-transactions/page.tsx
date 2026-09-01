import Link from "next/link";
import { requireSessionUser } from "@/lib/auth/require-session";
import { buttonClass, pageDescriptionClass, pageHeadingRowClass, pageStackClass } from "@/components/ui/styles";
import {
  listOwnedRecurringRules,
  RecurringRuleList,
} from "@/modules/recurring-transactions";

export const dynamic = "force-dynamic";

export default async function RecurringTransactionsPage() {
  const user = await requireSessionUser();
  const rows = await listOwnedRecurringRules(user.id);
  return (
    <div className={pageStackClass}>
      <div className={pageHeadingRowClass}>
        <p className={pageDescriptionClass}>Scheduling uses Asia/Jakarta and each occurrence is only created once.</p>
        <Link className={buttonClass("primary")} href="/recurring-transactions/new">Create rule</Link>
      </div>
      <RecurringRuleList rows={rows} />
    </div>
  );
}
