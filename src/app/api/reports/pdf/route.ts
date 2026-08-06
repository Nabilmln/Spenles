import { getSessionUser } from "@/lib/auth/require-session";
import { getProfile } from "@/modules/profiles";
import {
  getFinancialReport,
  validateOwnedReportFilters,
} from "@/modules/reports/queries/report-queries";
import { parseReportParams } from "@/modules/reports/schemas/export-params";
import { ExportLimitError } from "@/modules/reports/services/csv";
import {
  attachmentHeaders,
  safeExportError,
} from "@/modules/reports/services/export-response";
import { renderFinancialReportPdf } from "@/modules/reports/services/pdf";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function GET(request: Request) {
  const user = await getSessionUser();
  if (!user) return safeExportError(401, "Autentikasi diperlukan.");

  const filters = parseReportParams(new URL(request.url).searchParams);
  if (!filters) {
    return safeExportError(400, "Parameter laporan tidak valid.");
  }

  try {
    const filtersOwned = await validateOwnedReportFilters(user.id, filters);
    if (!filtersOwned) {
      return safeExportError(400, "Parameter laporan tidak valid.");
    }
    const profile = await getProfile(user.id);
    if (!profile) return safeExportError(500, "Laporan belum dapat dibuat.");
    const report = await getFinancialReport(
      user.id,
      profile.displayName,
      filters,
    );
    const pdf = await renderFinancialReportPdf(report);
    return new Response(new Uint8Array(pdf), {
      status: 200,
      headers: attachmentHeaders(
        "application/pdf",
        `spenles-report-${filters.interval.filePart}.pdf`,
      ),
    });
  } catch (error) {
    if (error instanceof ExportLimitError) {
      return safeExportError(422, error.message);
    }
    return safeExportError(500, "Laporan belum dapat dibuat.");
  }
}
