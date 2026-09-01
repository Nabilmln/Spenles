import { getSessionUser } from "@/lib/auth/require-session";
import { CSV_ROW_LIMIT } from "@/modules/reports/constants";
import {
  listCsvTransactions,
  validateOwnedReportFilters,
} from "@/modules/reports/queries/report-queries";
import { parseCsvParams } from "@/modules/reports/schemas/export-params";
import {
  ExportLimitError,
  serializeTransactionsCsv,
} from "@/modules/reports/services/csv";
import {
  attachmentHeaders,
  safeExportError,
} from "@/modules/reports/services/export-response";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function GET(request: Request) {
  const user = await getSessionUser();
  if (!user) return safeExportError(401, "Authentication is required.");

  const filters = parseCsvParams(new URL(request.url).searchParams);
  if (!filters) return safeExportError(400, "Invalid export parameters.");

  try {
    const filtersOwned = await validateOwnedReportFilters(user.id, filters);
    if (!filtersOwned) {
      return safeExportError(400, "Invalid export parameters.");
    }
    const rows = await listCsvTransactions(
      user.id,
      filters,
      CSV_ROW_LIMIT + 1,
    );
    const csv = serializeTransactionsCsv(rows);
    return new Response(csv, {
      status: 200,
      headers: attachmentHeaders(
        "text/csv; charset=utf-8",
        `spenles-transactions-${filters.interval.filePart}.csv`,
      ),
    });
  } catch (error) {
    if (error instanceof ExportLimitError) {
      return safeExportError(422, error.message);
    }
    return safeExportError(500, "Transaction export could not be created.");
  }
}
