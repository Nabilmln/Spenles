"use client";

import Link from "next/link";
import { CheckCircle2, Mail } from "lucide-react";
import { useToastActionState } from "@/components/ui/toast";
import { Input } from "@/components/ui/input";
import { FormMessage } from "@/components/ui/form-message";
import { buttonClass, fieldClass, fieldHintClass, textLinkClass } from "@/components/ui/styles";
import {
  requestPasswordResetAction,
  type ForgotPasswordActionState,
} from "../actions/forgot-password";
import { SubmitButton } from "./submit-button";

const initialState: ForgotPasswordActionState = {};

export function ForgotPasswordForm() {
  const [state, action] = useToastActionState(requestPasswordResetAction, initialState);

  if (state.success) {
    return (
      <div className="card grid gap-3 text-center">
        <span className="mx-auto grid size-11 place-items-center rounded-full bg-primary-50 text-primary-600">
          <CheckCircle2 aria-hidden="true" className="size-6" />
        </span>
        <div className="grid gap-[.35rem]">
          <h2 className="m-0 text-[1.05rem]">Check your inbox</h2>
          <p className="m-0 text-[.85rem] text-muted">
            If this email is registered, a secure reset link was sent to it. The
            link expires in 15 minutes.
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
      <div className={fieldClass}>
        <label htmlFor="email">Email</label>
        <div className="relative">
          <Mail
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 size-[1.05rem] -translate-y-1/2 text-muted"
          />
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            aria-describedby="email-error"
            aria-invalid={Boolean(state.fieldErrors?.email)}
            className="pl-10"
            required
          />
        </div>
        <FormMessage id="email-error">
          {state.fieldErrors?.email?.[0]}
        </FormMessage>
        <p className={fieldHintClass}>
          We&apos;ll send a one-time link. The request succeeds even when the
          email is not registered, so account details stay private.
        </p>
      </div>
      <SubmitButton idleLabel="Send reset link" pendingLabel="Sending..." />
      <p className="m-0 mt-[.2rem] text-center text-[.88rem] text-muted">
        Remembered it? <Link className={textLinkClass} href="/login">Sign in</Link>
      </p>
    </form>
  );
}