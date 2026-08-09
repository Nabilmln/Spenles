"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Input } from "@/components/ui/input";
import { FormMessage } from "@/components/ui/form-message";
import { mutedLinkClass, fieldClass, fieldLabelRowClass, textLinkClass } from "@/components/ui/styles";
import { loginAction, type AuthActionState } from "../actions/login";
import { PasswordField } from "./password-field";
import { SubmitButton } from "./submit-button";

const initialState: AuthActionState = {};

export function LoginForm() {
  const [state, action] = useActionState(loginAction, initialState);

  return (
    <form action={action} className="grid gap-[1.25rem]" noValidate>
      <FormMessage>{state.error}</FormMessage>
      <div className={fieldClass}>
        <label htmlFor="email">Email</label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          aria-describedby="email-error"
          aria-invalid={Boolean(state.fieldErrors?.email)}
          required
        />
        <FormMessage id="email-error">
          {state.fieldErrors?.email?.[0]}
        </FormMessage>
      </div>
      <div className={fieldClass}>
        <div className={fieldLabelRowClass}>
          <label htmlFor="password">Kata sandi</label>
          <span className={mutedLinkClass} aria-label="Pemulihan kata sandi belum tersedia">
            Lupa kata sandi?
          </span>
        </div>
        <PasswordField
          id="password"
          name="password"
          autoComplete="current-password"
          describedBy="password-error"
          invalid={Boolean(state.fieldErrors?.password)}
        />
        <FormMessage id="password-error">
          {state.fieldErrors?.password?.[0]}
        </FormMessage>
      </div>
      <SubmitButton idleLabel="Masuk" pendingLabel="Memproses..." />
      <p className="mt-[.3rem] text-center text-[.88rem] text-muted">
        Belum punya akun? <Link className={textLinkClass} href="/register">Daftar sekarang</Link>
      </p>
    </form>
  );
}
