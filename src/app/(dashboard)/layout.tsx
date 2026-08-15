import { AppShell } from "@/components/layout/app-shell";
import { requireSessionUser } from "@/lib/auth/require-session";
import { ensureUserFoundation } from "@/modules/onboarding";
import { getProfile } from "@/modules/profiles";
import { runRecurringSchedulerForUser } from "@/modules/recurring-transactions/services/run-scheduler";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireSessionUser();
  const displayName = user.name || user.email || "Pengguna Spenles";
  await ensureUserFoundation({ id: user.id, name: displayName });
  try {
    await runRecurringSchedulerForUser(user.id, new Date());
  } catch {
    // Best-effort: a scheduler failure must never block the dashboard.
  }

  let profile = await getProfile(user.id);
  if (!profile) {
    // Re-provision and read again once. ensureUserFoundation is idempotent and
    // getProfile is not React-cached, so this covers transient write/read skew
    // on the serverless HTTP driver before failing loudly.
    await ensureUserFoundation({ id: user.id, name: displayName });
    profile = await getProfile(user.id);
  }
  if (!profile) {
    throw new Error(
      `Profil belum dapat diinisialisasi (user ${user.id}). Pastikan migrasi database sudah dijalankan dan DATABASE_URL menunjuk ke database yang sama.`,
    );
  }
  return <AppShell profile={profile} email={user.email ?? ""}>{children}</AppShell>;
}
