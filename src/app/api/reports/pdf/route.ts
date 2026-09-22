import { getSessionUser } from "@/lib/auth/require-session";
import { getProfile } from "@/modules/profiles";
import {
  getFinancialReport,
  validateOwnedReportFilters,
} from "@/modules/reports/queries/report-queries";
import { parseReportParams } from "@/modules/reports/schemas/export-params";
import { ExportLimitError } from "@/modules/reports/services/export-error";
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
  if (!user) return safeExportError(401, "Authentication is required.");

  const url = new URL(request.url);
  const filters = parseReportParams(url.searchParams);
  if (!filters) {
    return safeExportError(400, "Invalid report parameters.");
  }

  try {
    const [filtersOwned, profile] = await Promise.all([
      validateOwnedReportFilters(user.id, filters),
      getProfile(user.id),
    ]);
    if (!filtersOwned) {
      return safeExportError(400, "Invalid report parameters.");
    }
    if (!profile) return safeExportError(500, "Report could not be created.");
    const report = await getFinancialReport(
      user.id,
      profile.displayName,
      filters,
    );
    const pdf = await renderFinancialReportPdf(report);
    const fileName = `spenles-report-${filters.interval.filePart}.pdf`;
    return new Response(new Uint8Array(pdf), {
      status: 200,
      headers: attachmentHeaders("application/pdf", fileName),
    });
  } catch (error) {
    if (error instanceof ExportLimitError) {
      return safeExportError(422, error.message);
    }
    return safeExportError(500, "Report could not be created.");
  }
}
