"use client";

import Link from "next/link";
import { Lock, Mail, User } from "lucide-react";
import { useToastActionState } from "@/components/ui/toast";
import { Input } from "@/components/ui/input";
import { FormMessage } from "@/components/ui/form-message";
import { fieldClass, textLinkClass } from "@/components/ui/styles";
import { registerAction } from "../actions/register";
import type { AuthActionState } from "../actions/login";
import { PasswordField } from "./password-field";
import { SubmitButton } from "./submit-button";

const initialState: AuthActionState = {};

export function RegisterForm() {
  const [state, action] = useToastActionState(registerAction, initialState);

  return (
    <form action={action} className="grid gap-[1.05rem]" noValidate>
      <div className={fieldClass}>
        <label htmlFor="name">Name</label>
        <div className="relative">
          <User
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 size-[1.05rem] -translate-y-1/2 text-muted"
          />
          <Input
            id="name"
            name="name"
            autoComplete="name"
            aria-describedby="name-error"
            aria-invalid={Boolean(state.fieldErrors?.name)}
            className="pl-10"
            required
          />
        </div>
        <FormMessage id="name-error">
          {state.fieldErrors?.name?.[0]}
        </FormMessage>
      </div>
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
      </div>
      <div className={fieldClass}>
        <label htmlFor="password">Password</label>
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
        <label htmlFor="passwordConfirmation">Confirm password</label>
        <PasswordField
          id="passwordConfirmation"
          name="passwordConfirmation"
          autoComplete="new-password"
          describedBy="confirmation-error"
          invalid={Boolean(state.fieldErrors?.passwordConfirmation)}
          leadingIcon={<Lock />}
        />
        <FormMessage id="confirmation-error">
          {state.fieldErrors?.passwordConfirmation?.[0]}
        </FormMessage>
      </div>
      <SubmitButton idleLabel="Create account" pendingLabel="Creating account..." />
      <p className="m-0 mt-[.2rem] text-center text-[.88rem] text-muted">
        Already have an account? <Link className={textLinkClass} href="/login">Sign in</Link>
      </p>
    </form>
  );
}