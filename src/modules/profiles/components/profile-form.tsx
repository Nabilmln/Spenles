"use client";

import { useActionState } from "react";
import type { Profile } from "@/db/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormMessage } from "@/components/ui/form-message";
import {
  updateProfileAction,
  type ProfileActionState,
} from "../actions/update-profile";

const initialState: ProfileActionState = {};

export function ProfileForm({
  profile,
  email,
}: {
  profile: Profile;
  email: string;
}) {
  const [state, action, pending] = useActionState(
    updateProfileAction,
    initialState,
  );

  return (
    <form action={action} className="settings-form">
      <FormMessage>{state.error}</FormMessage>
      {state.success ? (
        <p className="success-message" role="status">
          {state.success}
        </p>
      ) : null}
      <div className="field">
        <label htmlFor="displayName">Nama</label>
        <Input
          id="displayName"
          name="displayName"
          defaultValue={profile.displayName}
          aria-describedby="display-name-error"
          required
        />
        <FormMessage id="display-name-error">
          {state.fieldErrors?.displayName?.[0]}
        </FormMessage>
      </div>
      <div className="field">
        <label htmlFor="profileEmail">Email</label>
        <Input id="profileEmail" value={email} readOnly disabled />
        <span className="field-hint">Email dikelola oleh layanan autentikasi.</span>
      </div>
      <div className="settings-grid">
        <div className="field">
          <label htmlFor="defaultCurrency">Mata uang</label>
          <select
            className="input"
            id="defaultCurrency"
            name="defaultCurrency"
            defaultValue={profile.defaultCurrency}
          >
            <option value="IDR">IDR — Rupiah Indonesia</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="timezone">Zona waktu</label>
          <select
            className="input"
            id="timezone"
            name="timezone"
            defaultValue={profile.timezone}
          >
            <option value="Asia/Jakarta">Asia/Jakarta</option>
          </select>
        </div>
      </div>
      <div className="field">
        <label htmlFor="theme">Tema</label>
        <select
          className="input"
          id="theme"
          name="theme"
          defaultValue={profile.theme}
        >
          <option value="system">Ikuti sistem</option>
          <option value="light">Terang</option>
          <option value="dark">Gelap</option>
        </select>
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Menyimpan..." : "Simpan perubahan"}
      </Button>
    </form>
  );
}
