"use client";

import Link from "next/link";
import { Lock, Mail } from "lucide-react";
import { useToastActionState } from "@/components/ui/toast";
import { Input } from "@/components/ui/input";
import { FormMessage } from "@/components/ui/form-message";
import { fieldClass, fieldLabelRowClass, mutedLinkClass, textLinkClass } from "@/components/ui/styles";
import { loginAction, type AuthActionState } from "../actions/login";
import { PasswordField } from "./password-field";
import { SubmitButton } from "./submit-button";

const initialState: AuthActionState = {};

export function LoginForm() {
  const [state, action] = useToastActionState(loginAction, initialState);

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
      </div>
      <div className={fieldClass}>
        <div className={fieldLabelRowClass}>
          <label htmlFor="password">Password</label>
          <span className={mutedLinkClass} aria-label="Password recovery is not yet available">
            Forgot password?
          </span>
        </div>
        <PasswordField
          id="password"
          name="password"
          autoComplete="current-password"
          describedBy="password-error"
          invalid={Boolean(state.fieldErrors?.password)}
          leadingIcon={<Lock />}
        />
        <FormMessage id="password-error">
          {state.fieldErrors?.password?.[0]}
        </FormMessage>
      </div>
      <SubmitButton idleLabel="Sign in" pendingLabel="Signing in..." />
      <p className="m-0 mt-[.2rem] text-center text-[.88rem] text-muted">
        Don&apos;t have an account? <Link className={textLinkClass} href="/register">Create one</Link>
      </p>
    </form>
  );
}