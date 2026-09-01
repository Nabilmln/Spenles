import { NextResponse } from "next/server";
import { getServerEnv } from "@/lib/env/server";
import { runRecurringScheduler } from "@/modules/recurring-transactions/services/run-scheduler";
import { isSchedulerAuthorized } from "@/modules/recurring-transactions/services/scheduler-auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const noStoreHeaders = { "Cache-Control": "no-store" };

export async function GET(request: Request) {
  const url = new URL(request.url);
  if (url.searchParams.size > 0) {
    return NextResponse.json(
      { ok: false, error: "Unsupported parameter." },
      { status: 400, headers: noStoreHeaders },
    );
  }
  const secret = getServerEnv().CRON_SECRET;
  if (!isSchedulerAuthorized(request.headers.get("authorization"), secret)) {
    return NextResponse.json(
      { ok: false, error: "Not allowed." },
      { status: 401, headers: noStoreHeaders },
    );
  }
  const result = await runRecurringScheduler();
  return NextResponse.json(result, {
    status: result.ok ? 200 : 207,
    headers: noStoreHeaders,
  });
}
