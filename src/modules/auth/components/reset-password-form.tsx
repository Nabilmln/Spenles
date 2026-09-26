"use client";

import Link from "next/link";
import { CheckCircle2, KeyRound, Lock } from "lucide-react";
import { useToastActionState } from "@/components/ui/toast";
import { FormMessage } from "@/components/ui/form-message";
import { buttonClass, fieldClass, textLinkClass } from "@/components/ui/styles";
import { resetPasswordAction, type ResetPasswordActionState } from "../actions/reset-password";
import { PasswordField } from "./password-field";
import { SubmitButton } from "./submit-button";

const initialState: ResetPasswordActionState = {};

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, action] = useToastActionState(resetPasswordAction, initialState);

  if (state.success) {
    return (
      <div className="card grid gap-3 text-center">
        <span className="mx-auto grid size-11 place-items-center rounded-full bg-primary-50 text-primary-600">
          <CheckCircle2 aria-hidden="true" className="size-6" />
        </span>
        <div className="grid gap-[.35rem]">
          <h2 className="m-0 text-[1.05rem]">Password updated</h2>
          <p className="m-0 text-[.85rem] text-muted">
            Your password was reset. You can now sign in with the new password.
          </p>
        </div>
        <Link className={buttonClass("primary")} href="/login">
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <form action={action} className="grid gap-[1.05rem]" noValidate>
      <input type="hidden" name="token" value={token} />
      <div className={fieldClass}>
        <label htmlFor="password">New password</label>
        <PasswordField
          id="password"
          name="password"
          autoComplete="new-password"
          describedBy="password-error"
          invalid={Boolean(state.fieldErrors?.password)}
          leadingIcon={<Lock />}
        />
        <FormMessage id="password-error">
          {state.fieldErrors?.password?.[0]}
        </FormMessage>
      </div>
      <div className={fieldClass}>
        <label htmlFor="passwordConfirmation">Confirm new password</label>
        <PasswordField
          id="passwordConfirmation"
          name="passwordConfirmation"
          autoComplete="new-password"
          describedBy="password-confirmation-error"
          invalid={Boolean(state.fieldErrors?.passwordConfirmation)}
          leadingIcon={<KeyRound />}
        />
        <FormMessage id="password-confirmation-error">
          {state.fieldErrors?.passwordConfirmation?.[0]}
        </FormMessage>
      </div>
      <SubmitButton idleLabel="Save new password" pendingLabel="Saving..." />
      <p className="m-0 mt-[.2rem] text-center text-[.88rem] text-muted">
        Need another link?{" "}
        <Link className={textLinkClass} href="/forgot-password">
          Request a new one
        </Link>
      </p>
    </form>
  );
}