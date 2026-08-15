import { AppShell } from "@/components/layout/app-shell";
import { requireSessionUser } from "@/lib/auth/require-session";
import { ensureUserFoundation } from "@/modules/onboarding";
import { getProfile } from "@/modules/profiles";
import { runRecurringSchedulerForUser } from "@/modules/recurring-transactions/services/run-scheduler";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireSessionUser();
  await ensureUserFoundation({
    id: user.id,
    name: user.name || user.email || "Pengguna Spenles",
  });
  try {
    await runRecurringSchedulerForUser(user.id, new Date());
  } catch {
    // Best-effort: a scheduler failure must never block the dashboard.
  }
  const profile = await getProfile(user.id);
  if (!profile) throw new Error("Profil belum dapat diinisialisasi.");
  return <AppShell profile={profile} email={user.email ?? ""}>{children}</AppShell>;
}
