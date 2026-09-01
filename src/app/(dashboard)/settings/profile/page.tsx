import { Card } from "@/components/ui/card";
import { requireSessionUser } from "@/lib/auth/require-session";
import { narrowPageClass, pageDescriptionClass, pageStackClass } from "@/components/ui/styles";
import { getProfile, ProfileForm } from "@/modules/profiles";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const user = await requireSessionUser();
  const profile = await getProfile(user.id);
  if (!profile) throw new Error("Profile not found.");
  return (
    <div className={`${pageStackClass} ${narrowPageClass}`}>
      <p className={pageDescriptionClass}>Set your display identity and basic app preferences.</p>
      <Card><ProfileForm profile={profile} email={user.email ?? ""} /></Card>
    </div>
  );
}
