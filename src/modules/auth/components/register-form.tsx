"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Input } from "@/components/ui/input";
import { FormMessage } from "@/components/ui/form-message";
import { textLinkClass } from "@/components/ui/styles";
import { registerAction } from "../actions/register";
import type { AuthActionState } from "../actions/login";
import { PasswordField } from "./password-field";
import { SubmitButton } from "./submit-button";

const initialState: AuthActionState = {};

export function RegisterForm() {
  const [state, action] = useActionState(registerAction, initialState);

  return (
    <form action={action} className="grid gap-[1.25rem]" noValidate>
      <FormMessage>{state.error}</FormMessage>
      <div className="field">
        <label htmlFor="name">Nama</label>
        <Input
          id="name"
          name="name"
          autoComplete="name"
          aria-describedby="name-error"
          aria-invalid={Boolean(state.fieldErrors?.name)}
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
          aria-invalid={Boolean(state.fieldErrors?.email)}
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
          invalid={Boolean(state.fieldErrors?.password)}
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
          invalid={Boolean(state.fieldErrors?.passwordConfirmation)}
        />
        <FormMessage id="confirmation-error">
          {state.fieldErrors?.passwordConfirmation?.[0]}
        </FormMessage>
      </div>
      <SubmitButton idleLabel="Buat akun" pendingLabel="Mendaftarkan..." />
      <p className="mt-[.3rem] text-center text-[.88rem] text-muted">
        Sudah punya akun? <Link className={textLinkClass} href="/login">Masuk</Link>
      </p>
    </form>
  );
}
