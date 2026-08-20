import { redirect } from "next/navigation";
import { LoginForm } from "@/modules/auth/components/login-form";
import { getSessionUser } from "@/lib/auth/require-session";
import { eyebrowClass } from "@/components/ui/styles";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  if (await getSessionUser()) redirect("/dashboard");
  return (
    <>
      <div className="mb-7">
        <p className={eyebrowClass}>Selamat datang kembali</p>
        <h1 className="mb-[.6rem] text-[clamp(1.45rem,2.5vw,1.85rem)] leading-[1.2] tracking-[-.02em]">
          Masuk ke Spenles
        </h1>
        <p className="m-0 text-[.88rem] text-muted">
          Gunakan akun Anda untuk membuka ruang keuangan pribadi.
        </p>
      </div>
      <LoginForm />
    </>
  );
}