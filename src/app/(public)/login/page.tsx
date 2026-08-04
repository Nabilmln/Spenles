import { redirect } from "next/navigation";
import { LoginForm } from "@/modules/auth/components/login-form";
import { getSessionUser } from "@/lib/auth/require-session";

export const metadata = { title: "Masuk" };
export const dynamic = "force-dynamic";

export default async function LoginPage() {
  if (await getSessionUser()) redirect("/dashboard");
  return (
    <>
      <div className="auth-heading">
        <p className="eyebrow">Selamat datang kembali</p>
        <h1>Masuk ke Spenles</h1>
        <p>Gunakan akun Anda untuk membuka ruang keuangan pribadi.</p>
      </div>
      <LoginForm />
    </>
  );
}
