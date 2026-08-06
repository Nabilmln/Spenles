import { getSessionUser } from "@/lib/auth/require-session";
import {
  BACKUP_RECORD_LIMIT,
  REPORT_TIMEZONE,
} from "@/modules/reports/constants";
import {
  getPersonalDataBackupJson,
  getPersonalDataBackupRecordCount,
} from "@/modules/reports/queries/backup-query";
import {
  assertExportSize,
  attachmentHeaders,
  safeExportError,
} from "@/modules/reports/services/export-response";
import { ExportLimitError } from "@/modules/reports/services/csv";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

function jakartaDate(value: Date) {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: REPORT_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(value);
}

export async function GET(request: Request) {
  const user = await getSessionUser();
  if (!user) return safeExportError(401, "Autentikasi diperlukan.");
  if ([...new URL(request.url).searchParams].length > 0) {
    return safeExportError(400, "Parameter ekspor tidak valid.");
  }

  try {
    const exportedAt = new Date();
    const recordCount = await getPersonalDataBackupRecordCount(user.id);
    if (recordCount > BACKUP_RECORD_LIMIT) {
      throw new ExportLimitError(
        `Backup melebihi batas ${BACKUP_RECORD_LIMIT.toLocaleString("id-ID")} rekaman.`,
      );
    }
    const backup = await getPersonalDataBackupJson(user.id, exportedAt);
    assertExportSize(backup);
    return new Response(backup, {
      status: 200,
      headers: attachmentHeaders(
        "application/json; charset=utf-8",
        `spenles-backup-${jakartaDate(exportedAt)}.json`,
      ),
    });
  } catch (error) {
    if (error instanceof ExportLimitError) {
      return safeExportError(422, error.message);
    }
    return safeExportError(500, "Backup belum dapat dibuat.");
  }
}
