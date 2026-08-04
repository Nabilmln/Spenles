"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Input } from "@/components/ui/input";
import { FormMessage } from "@/components/ui/form-message";
import { loginAction, type AuthActionState } from "../actions/login";
import { PasswordField } from "./password-field";
import { SubmitButton } from "./submit-button";

const initialState: AuthActionState = {};

export function LoginForm() {
  const [state, action] = useActionState(loginAction, initialState);

  return (
    <form action={action} className="auth-form" noValidate>
      <FormMessage>{state.error}</FormMessage>
      <div className="field">
        <label htmlFor="email">Email</label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          aria-describedby="email-error"
          required
        />
        <FormMessage id="email-error">
          {state.fieldErrors?.email?.[0]}
        </FormMessage>
      </div>
      <div className="field">
        <div className="field-label-row">
          <label htmlFor="password">Kata sandi</label>
          <span className="muted-link" aria-label="Pemulihan kata sandi belum tersedia">
            Lupa kata sandi?
          </span>
        </div>
        <PasswordField
          id="password"
          name="password"
          autoComplete="current-password"
          describedBy="password-error"
        />
        <FormMessage id="password-error">
          {state.fieldErrors?.password?.[0]}
        </FormMessage>
      </div>
      <SubmitButton idleLabel="Masuk" pendingLabel="Memproses..." />
      <p className="auth-alternative">
        Belum punya akun? <Link href="/register">Daftar sekarang</Link>
      </p>
    </form>
  );
}
