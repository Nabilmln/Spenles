import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/layout/section-heading";
import { requireSessionUser } from "@/lib/auth/require-session";
import { getProfile, ProfileForm } from "@/modules/profiles";

export const metadata = { title: "Profil" };
export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const user = await requireSessionUser();
  const profile = await getProfile(user.id);
  if (!profile) throw new Error("Profil tidak ditemukan.");
  return (
    <div className="page-stack narrow-page">
      <SectionHeading eyebrow="Pengaturan" title="Profil dan preferensi" description="Atur identitas tampilan dan preferensi dasar aplikasi." />
      <Card><ProfileForm profile={profile} email={user.email ?? ""} /></Card>
    </div>
  );
}
