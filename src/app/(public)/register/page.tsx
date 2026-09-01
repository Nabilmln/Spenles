import { redirect } from "next/navigation";
import { RegisterForm } from "@/modules/auth/components/register-form";
import { getSessionUser } from "@/lib/auth/require-session";
import { eyebrowClass } from "@/components/ui/styles";

export const dynamic = "force-dynamic";

export default async function RegisterPage() {
  if (await getSessionUser()) redirect("/dashboard");
  return (
    <>
      <div className="mb-7">
        <p className={eyebrowClass}>Start with a clean foundation</p>
        <h1 className="mb-[.6rem] text-[clamp(1.45rem,2.5vw,1.85rem)] leading-[1.2] tracking-[-.02em]">
          Create your Spenles account
        </h1>
        <p className="m-0 text-[.88rem] text-muted">
          Your profile, default categories, and main wallet will be set up automatically.
        </p>
      </div>
      <RegisterForm />
    </>
  );
}