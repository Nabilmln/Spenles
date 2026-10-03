import { afterEach, describe, expect, it, vi } from "vitest";
import { ReportEmailConfigurationError, sendReportEmail } from "./report-email";

const input = {
  to: "reader@example.com",
  fileName: "report.pdf",
  pdf: Buffer.from("pdf-test"),
  rangeLabel: "1–7 October 2026",
  accountName: "Daily account",
};

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("report email delivery", () => {
  it("fails before sending when sender credentials are missing", async () => {
    vi.stubEnv("RESEND_API_KEY", "");
    vi.stubEnv("REPORT_EMAIL_FROM", "");
    const send = vi.fn();

    await expect(sendReportEmail(input, send)).rejects.toBeInstanceOf(ReportEmailConfigurationError);
    expect(send).not.toHaveBeenCalled();
  });

  it("sends the filtered PDF as a Base64 attachment", async () => {
    vi.stubEnv("RESEND_API_KEY", "test-key");
    vi.stubEnv("REPORT_EMAIL_FROM", "reports@example.com");
    const send = vi.fn<typeof fetch>(async () => new Response(JSON.stringify({ id: "message-1" }), { status: 200 }));

    await sendReportEmail(input, send);

    const [url, options] = send.mock.calls[0];
    expect(url).toBe("https://api.resend.com/emails");
    if (!options) throw new Error("Missing email request options");
    const body = JSON.parse(options.body as string);
    expect(body.to).toEqual(["reader@example.com"]);
    expect(body.attachments).toEqual([
      { filename: "report.pdf", content: Buffer.from("pdf-test").toString("base64") },
    ]);
  });

  it("does not report success when the provider rejects the request", async () => {
    vi.stubEnv("RESEND_API_KEY", "test-key");
    vi.stubEnv("REPORT_EMAIL_FROM", "reports@example.com");
    const send = vi.fn<typeof fetch>(async () => new Response(null, { status: 422 }));

    await expect(sendReportEmail(input, send)).rejects.toThrow("Email provider rejected");
  });
});
