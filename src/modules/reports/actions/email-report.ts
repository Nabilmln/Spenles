"use server";

import { z } from "zod";
import { requireSessionUser } from "@/lib/auth/require-session";
import { getProfile } from "@/modules/profiles";
import { getFinancialReport, validateOwnedReportFilters } from "../queries/report-queries";
import { getReportOptions } from "../queries/report-options";
import { parseReportParams } from "../schemas/export-params";
import { ExportLimitError } from "../services/export-error";
import { renderFinancialReportPdf } from "../services/pdf";
import { ReportEmailConfigurationError, sendReportEmail } from "../services/report-email";

export type EmailReportState = { error?: string; success?: string };

const emailSchema = z.email().max(254);

export async function emailReportAction(
  _state: EmailReportState,
  formData: FormData,
): Promise<EmailReportState> {
  const user = await requireSessionUser();
  const recipient = emailSchema.safeParse(String(formData.get("email") ?? "").trim());
  if (!recipient.success) return { error: "Enter a valid recipient email." };

  const accountId = formData.get("accountId");
  const from = formData.get("from");
  const to = formData.get("to");
  if (typeof accountId !== "string" || !accountId) {
    return { error: "Choose an account to export." };
  }
  if (typeof from !== "string" || typeof to !== "string") {
    return { error: "Choose a date range." };
  }

  const params = new URLSearchParams({
    period: "custom",
    from,
    to,
    account: accountId,
    details: "true",
  });
  const filters = parseReportParams(params);
  if (!filters) return { error: "Choose valid dates up to today, within a 366-day range." };

  try {
    const [owned, profile, options] = await Promise.all([
      validateOwnedReportFilters(user.id, filters),
      getProfile(user.id),
      getReportOptions(user.id),
    ]);
    const account = options.accounts.find((item) => item.id === accountId);
    if (!owned || !account) return { error: "Choose one of your accounts." };
    if (!profile) return { error: "Report could not be created." };

    const report = await getFinancialReport(user.id, profile.displayName, filters);
    const pdf = await renderFinancialReportPdf(report);
    await sendReportEmail({
      to: recipient.data,
      fileName: `spenles-report-${filters.interval.filePart}.pdf`,
      pdf,
      rangeLabel: filters.interval.label,
      accountName: account.name,
    });
    return { success: `Report queued for delivery to ${recipient.data}.` };
  } catch (error) {
    if (error instanceof ExportLimitError) return { error: error.message };
    if (error instanceof ReportEmailConfigurationError) return { error: error.message };
    return { error: "Report email could not be sent. Please try again." };
  }
}
