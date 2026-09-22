import { EXPORT_MAX_BYTES, PRIVATE_EXPORT_HEADERS } from "../constants";
import { ExportLimitError } from "./export-error";

export function exportHeaders(
  contentType: string,
  fileName: string,
  disposition: "attachment" | "inline" = "attachment",
) {
  return {
    ...PRIVATE_EXPORT_HEADERS,
    "Content-Type": contentType,
    "Content-Disposition": `${disposition}; filename="${fileName}"`,
  };
}

export function attachmentHeaders(contentType: string, fileName: string) {
  return exportHeaders(contentType, fileName, "attachment");
}

export function inlineHeaders(contentType: string, fileName: string) {
  return exportHeaders(contentType, fileName, "inline");
}

export function assertExportSize(value: string | Uint8Array) {
  const bytes =
    typeof value === "string" ? Buffer.byteLength(value, "utf8") : value.byteLength;
  if (bytes > EXPORT_MAX_BYTES) {
    throw new ExportLimitError("Export result size exceeds the 3.5 MB limit.");
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
