import { redirect } from "next/navigation";
import { RegisterForm } from "@/modules/auth/components/register-form";
import { getSessionUser } from "@/lib/auth/require-session";

export const metadata = { title: "Daftar" };
export const dynamic = "force-dynamic";

export default async function RegisterPage() {
  if (await getSessionUser()) redirect("/dashboard");
  return (
    <>
      <div className="auth-heading">
        <p className="eyebrow">Mulai dengan fondasi yang rapi</p>
        <h1>Buat akun Spenles</h1>
        <p>Profil, kategori awal, dan Kas Utama akan disiapkan otomatis.</p>
      </div>
      <RegisterForm />
    </>
  );
}
