import Link from "next/link";
import { redirect } from "next/navigation";
import { ResetPasswordForm } from "@/modules/auth/components/reset-password-form";
import { getSessionUser } from "@/lib/auth/require-session";
import { buttonClass, eyebrowClass, textLinkClass } from "@/components/ui/styles";

export const dynamic = "force-dynamic";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  if (await getSessionUser()) redirect("/dashboard");

  const { token } = await searchParams;

  if (!token) {
    return (
      <>
        <div className="mb-7">
          <p className={eyebrowClass}>Set a new password</p>
          <h1 className="mb-[.6rem] text-[clamp(1.45rem,2.5vw,1.85rem)] leading-[1.2] tracking-[-.02em]">
            Invalid reset link
          </h1>
          <p className="m-0 text-[.88rem] text-muted">
            This request is missing the reset token. Request a new link and open
            it from your email.
          </p>
        </div>
        <Link className={buttonClass("primary")} href="/forgot-password">
          Request a new link
        </Link>
        <p className="m-0 mt-[.2rem] text-center text-[.88rem] text-muted">
          Or{" "}
          <Link className={textLinkClass} href="/login">
            sign in
          </Link>
        </p>
      </>
    );
  }

  return (
    <>
      <div className="mb-7">
        <p className={eyebrowClass}>Set a new password</p>
        <h1 className="mb-[.6rem] text-[clamp(1.45rem,2.5vw,1.85rem)] leading-[1.2] tracking-[-.02em]">
          Create a new password
        </h1>
        <p className="m-0 text-[.88rem] text-muted">
          Choose a new password for your account. It must be at least 8
          characters long.
        </p>
      </div>
      <ResetPasswordForm token={token} />
    </>
  );
}