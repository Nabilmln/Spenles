import { redirect } from "next/navigation";
import { RegisterForm } from "@/modules/auth/components/register-form";
import { getSessionUser } from "@/lib/auth/require-session";
import { eyebrowClass } from "@/components/ui/styles";

export const metadata = { title: "Daftar" };
export const dynamic = "force-dynamic";

export default async function RegisterPage() {
  if (await getSessionUser()) redirect("/dashboard");
  return (
    <>
      <div className="mb-8">
        <p className={eyebrowClass}>Mulai dengan fondasi yang rapi</p>
        <h1 className="mb-[.65rem] text-[clamp(1.75rem,4vw,2.35rem)] leading-[1.15] tracking-[-.04em]">Buat akun Spenles</h1>
        <p className="text-muted">Profil, kategori awal, dan Kas Utama akan disiapkan otomatis.</p>
      </div>
      <RegisterForm />
    </>
  );
}
