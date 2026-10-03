import "server-only";

import { z } from "zod";

const senderSchema = z.string().email();

export class ReportEmailConfigurationError extends Error {}

export async function sendReportEmail(input: {
  to: string;
  fileName: string;
  pdf: Buffer;
  rangeLabel: string;
  accountName: string;
}, send: typeof fetch = fetch) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.REPORT_EMAIL_FROM;
  if (!apiKey || !from || !senderSchema.safeParse(from).success) {
    throw new ReportEmailConfigurationError("Email reports are not configured yet.");
  }

  const response = await send("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: `Spenles <${from}>`,
      to: [input.to],
      subject: `Your Spenles report · ${input.rangeLabel}`,
      text: `Your report for ${input.accountName}, ${input.rangeLabel}, is attached as a PDF.`,
      attachments: [{ filename: input.fileName, content: input.pdf.toString("base64") }],
    }),
    signal: AbortSignal.timeout(15_000),
    cache: "no-store",
  });

  if (!response.ok) throw new Error("Email provider rejected the report.");
}
