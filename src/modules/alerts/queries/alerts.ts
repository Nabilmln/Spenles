import "server-only";

import { db } from "@/db";
import type { Database } from "@/db/types";
import { jakartaMonthForDate } from "@/lib/dates/jakarta-month";
import { listCurrentBudgetAlerts } from "@/modules/budgets/queries/budgets";
import { listRecurringFailureAlerts } from "@/modules/recurring-transactions/queries/recurring-rules";

export type Phase04Alert = {
  id: string;
  tone: "warning" | "danger";
  title: string;
  message: string;
  href: string;
};

export async function listOwnedPhase04Alerts(
  userId: string,
  now = new Date(),
  database: Database = db,
): Promise<Phase04Alert[]> {
  const [budgets, recurring] = await Promise.all([
    listCurrentBudgetAlerts(userId, jakartaMonthForDate(now), database),
    listRecurringFailureAlerts(userId, database),
  ]);
  return [
    ...budgets.map((budget) => ({
      id: `budget-${budget.id}`,
      tone:
        budget.budgetStatus === "exceeded"
          ? ("danger" as const)
          : ("warning" as const),
      title:
        budget.budgetStatus === "exceeded"
          ? `Anggaran ${budget.categoryName} terlewati`
          : `Anggaran ${budget.categoryName} mendekati batas`,
      message:
        budget.budgetStatus === "exceeded"
          ? "Pemakaian bulan ini sudah melebihi jumlah anggaran."
          : "Pemakaian bulan ini sudah mencapai ambang peringatan.",
      href: "/budgets",
    })),
    ...recurring.map((rule) => ({
      id: `recurring-${rule.id}`,
      tone: "warning" as const,
      title: `Aturan ${rule.categoryName} memerlukan perhatian`,
      message:
        rule.pauseReason === "blocked_account"
          ? "Akun aturan ini tidak lagi aktif."
          : rule.pauseReason === "blocked_category"
            ? "Kategori aturan ini tidak lagi aktif."
            : "Transaksi berulang terakhir belum dapat dibuat.",
      href: "/recurring-transactions",
    })),
  ];
}
