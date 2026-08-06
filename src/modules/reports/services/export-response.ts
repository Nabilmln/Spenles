import { EXPORT_MAX_BYTES, PRIVATE_EXPORT_HEADERS } from "../constants";
import { ExportLimitError } from "./csv";

export function attachmentHeaders(contentType: string, fileName: string) {
  return {
    ...PRIVATE_EXPORT_HEADERS,
    "Content-Type": contentType,
    "Content-Disposition": `attachment; filename="${fileName}"`,
  };
}

export function assertExportSize(value: string | Uint8Array) {
  const bytes =
    typeof value === "string" ? Buffer.byteLength(value, "utf8") : value.byteLength;
  if (bytes > EXPORT_MAX_BYTES) {
    throw new ExportLimitError("Ukuran hasil ekspor melebihi batas 3,5 MB.");
  }
}

export function safeExportError(status: 400 | 401 | 422 | 500, message: string) {
  return Response.json(
    { error: message },
    {
      status,
      headers: {
        ...PRIVATE_EXPORT_HEADERS,
        "Content-Type": "application/json; charset=utf-8",
      },
    },
  );
}
