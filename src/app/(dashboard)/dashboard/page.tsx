import Link from "next/link";
import { Suspense } from "react";
import { requireSessionUser } from "@/lib/auth/require-session";
import { buttonClass, cardClass } from "@/components/ui/styles";
import {
  DashboardBalanceSection,
  DashboardCardSkeleton,
  DashboardRecentActivitySection,
  getRecentActivityTransactions,
  safeParseDashboardFilters,
  ServicesSection,
  type DashboardSearchParams,
} from "@/modules/dashboard";
import { listOwnedAccounts } from "@/modules/accounts";
import { getProfile } from "@/modules/profiles";
import type { Profile } from "@/db/schema";

function profileFallback(userId: string): Profile {
  return {
    id: userId,
    userId,
    displayName: "Spenles User",
    avatarIndex: null,
    defaultCurrency: "IDR",
    timezone: "Asia/Jakarta",
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

type DashboardPageProps = { searchParams: Promise<DashboardSearchParams> };

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const user = await requireSessionUser();
  const [profile, rawSearchParams] = await Promise.all([
    getProfile(user.id),
    searchParams,
  ]);
  const filtersResult = safeParseDashboardFilters(rawSearchParams);
  if (!filtersResult.success) {
    return (
      <section className={`${cardClass} flex items-center gap-[.8rem] shadow-none`} role="alert">
        <div>
          <h2 className="m-[0_0_.25rem]! text-base!">Check your period selection</h2>
          <p className="m-0 text-muted text-[.84rem]">{filtersResult.error}</p>
        </div>
        <Link className={buttonClass("primary")} href="/dashboard">Back to this month</Link>
      </section>
    );
  }

  const accountsPromise = listOwnedAccounts(user.id);
  const activityPromise = getRecentActivityTransactions(user.id);

  return (
    <div className="grid gap-[1.55rem]">
      <Suspense fallback={<DashboardCardSkeleton label="Financial summary" />}>
        <DashboardBalanceSection accountsPromise={accountsPromise} />
      </Suspense>
      <ServicesSection profile={profile ?? profileFallback(user.id)} email={user.email ?? ""} />
      <Suspense fallback={<DashboardCardSkeleton label="Recent activity" />}>
        <DashboardRecentActivitySection activityPromise={activityPromise} />
      </Suspense>
    </div>
  );
}
