import "server-only";

import path from "node:path";
import { Font, renderToBuffer } from "@react-pdf/renderer";
import { EXPORT_MAX_BYTES } from "../constants";
import { FinancialReportDocument } from "../components/financial-report-document";
import type { FinancialReport } from "../types";
import { ExportLimitError } from "./csv";

let fontsRegistered = false;

function registerFonts() {
  if (fontsRegistered) return;
  const fontDirectory = path.join(
    process.cwd(),
    "node_modules",
    "@fontsource",
    "noto-sans",
    "files",
  );
  Font.register({
    family: "Noto Sans",
    fonts: [
      {
        src: path.join(fontDirectory, "noto-sans-latin-ext-400-normal.woff"),
        fontWeight: 400,
      },
      {
        src: path.join(fontDirectory, "noto-sans-latin-ext-600-normal.woff"),
        fontWeight: 600,
      },
    ],
  });
  fontsRegistered = true;
}

export async function renderFinancialReportPdf(
  report: FinancialReport,
  renderer: typeof renderToBuffer = renderToBuffer,
) {
  registerFonts();
  const buffer = await renderer(
    <FinancialReportDocument report={report} />,
  );
  if (buffer.byteLength > EXPORT_MAX_BYTES) {
    throw new ExportLimitError("Ukuran laporan PDF melebihi batas 3,5 MB.");
  }
  return buffer;
}
