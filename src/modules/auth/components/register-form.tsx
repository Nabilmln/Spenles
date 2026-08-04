"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Input } from "@/components/ui/input";
import { FormMessage } from "@/components/ui/form-message";
import { registerAction } from "../actions/register";
import type { AuthActionState } from "../actions/login";
import { PasswordField } from "./password-field";
import { SubmitButton } from "./submit-button";

const initialState: AuthActionState = {};

export function RegisterForm() {
  const [state, action] = useActionState(registerAction, initialState);

  return (
    <form action={action} className="auth-form" noValidate>
      <FormMessage>{state.error}</FormMessage>
      <div className="field">
        <label htmlFor="name">Nama</label>
        <Input
          id="name"
          name="name"
          autoComplete="name"
          aria-describedby="name-error"
          required
        />
        <FormMessage id="name-error">
          {state.fieldErrors?.name?.[0]}
        </FormMessage>
      </div>
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
        <label htmlFor="password">Kata sandi</label>
        <PasswordField
          id="password"
          name="password"
          autoComplete="new-password"
          describedBy="password-error"
        />
        <FormMessage id="password-error">
          {state.fieldErrors?.password?.[0]}
        </FormMessage>
      </div>
      <div className="field">
        <label htmlFor="passwordConfirmation">Konfirmasi kata sandi</label>
        <PasswordField
          id="passwordConfirmation"
          name="passwordConfirmation"
          autoComplete="new-password"
          describedBy="confirmation-error"
        />
        <FormMessage id="confirmation-error">
          {state.fieldErrors?.passwordConfirmation?.[0]}
        </FormMessage>
      </div>
      <SubmitButton idleLabel="Buat akun" pendingLabel="Mendaftarkan..." />
      <p className="auth-alternative">
        Sudah punya akun? <Link href="/login">Masuk</Link>
      </p>
    </form>
  );
}
