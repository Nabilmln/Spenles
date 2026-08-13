import { redirect } from "next/navigation";
import { LoginForm } from "@/modules/auth/components/login-form";
import { getSessionUser } from "@/lib/auth/require-session";
import { eyebrowClass } from "@/components/ui/styles";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  if (await getSessionUser()) redirect("/dashboard");
  return (
    <>
      <div className="mb-8">
        <p className={eyebrowClass}>Selamat datang kembali</p>
        <h1 className="mb-[.65rem] text-[clamp(1.75rem,4vw,2.35rem)] leading-[1.15] tracking-[-.04em]">Masuk ke Spenles</h1>
        <p className="text-muted">Gunakan akun Anda untuk membuka ruang keuangan pribadi.</p>
      </div>
      <LoginForm />
    </>
  );
}
